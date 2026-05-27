import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, AlignLeft, CheckCircle, CalendarPlus, Users, AlertCircle, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import DayTimeline from "../components/DayTimeline";
import { roomService, reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}
function fromMinutes(m) {
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function findAlternativeSlots(reservations, wantedStart, wantedEnd, maxSuggestions = 3) {
    const duration = toMinutes(wantedEnd) - toMinutes(wantedStart);
    if (duration <= 0) return [];

    const DAY_START = 8 * 60;
    const DAY_END = 20 * 60;

    // Intervalos ocupados, ordenados por início
    const busy = reservations
        .map(r => ({ s: toMinutes(r.start_time.slice(11, 16)), e: toMinutes(r.end_time.slice(11, 16)) }))
        .sort((a, b) => a.s - b.s);

    const suggestions = [];
    // Tentar a partir do horário pedido, depois antes, em incrementos de 30min
    const candidates = [];
    for (let t = toMinutes(wantedStart); t + duration <= DAY_END; t += 30) candidates.push(t);
    for (let t = toMinutes(wantedStart) - 30; t >= DAY_START; t -= 30) candidates.push(t);

    for (const start of candidates) {
        const end = start + duration;
        if (start < DAY_START || end > DAY_END) continue;
        const overlaps = busy.some(b => start < b.e && end > b.s);
        if (!overlaps) {
            const label = `${fromMinutes(start)} – ${fromMinutes(end)}`;
            if (!suggestions.find(s => s.label === label)) {
                suggestions.push({ start: fromMinutes(start), end: fromMinutes(end), label });
            }
        }
        if (suggestions.length >= maxSuggestions) break;
    }
    return suggestions;
}

export default function NewReservation() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const preselectedRoom = location.state?.room ?? null;
    const preselectedDate = location.state?.date ?? "";
    const preselectedStart = location.state?.startTime ?? "";
    const preselectedEnd = location.state?.endTime ?? "";

    // Dados do Formulário
    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState(preselectedRoom?.id ?? "");
    const [date, setDate] = useState(preselectedDate);
    const [startTime, setStartTime] = useState(preselectedStart);
    const [endTime, setEndTime] = useState(preselectedEnd);
    const [purpose, setPurpose] = useState("");

    const [loading, setLoading] = useState(false);
    const [hasConflict, setHasConflict] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleConflict = (conflict, reservations) => {
        setHasConflict(conflict);
        if (conflict && startTime && endTime && reservations) {
            setSuggestions(findAlternativeSlots(reservations, startTime, endTime));
        } else {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        async function fetchRooms() {
            try {
                const data = await roomService.getAll();
                setRooms(data);
                if (!preselectedRoom && data.length > 0) setRoomId(data[0].id);
            } catch (err) {
                console.error("Erro ao carregar salas", err);
            }
        }
        fetchRooms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!date || !startTime || !endTime) {
            toast.error("Preenche a data e os horários antes de continuar.");
            setLoading(false);
            return;
        }

        if (startTime >= endTime) {
            toast.error("A hora de fim tem de ser depois do início.");
            setLoading(false);
            return;
        }

        try {
            const startFull = `${date} ${startTime}:00`;
            const endFull = `${date} ${endTime}:00`;

            await reservationService.create({
                user_id: user.id,
                rooms_id: roomId,
                start_time: startFull,
                end_time: endFull,
                purpose
            });

            toast.success("Reserva criada com sucesso!");
            navigate("/my-reservations");
        } catch (err) {
            console.error(err);
            toast.error(translateMessage(err.message) || "Erro ao criar reserva. Verifica se a sala já não está ocupada nesse horário.");
        } finally {
            setLoading(false);
        }
    };

    const selectedRoom = rooms.find(r => String(r.id) === String(roomId));

    return (
        <Layout>
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2.5">
                    <CalendarPlus size={24} className="text-blue-500" /> Nova Reserva
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Preenche os detalhes e confirma a disponibilidade antes de reservar.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* ── FORMULÁRIO ── */}
                <div className="xl:col-span-2 flex flex-col gap-4">

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                        {/* Sala */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sala</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={16} />
                                <select
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-slate-200"
                                >
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.name} — cap. {room.capacity}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Info da sala selecionada */}
                            {selectedRoom && (
                                <div className="flex items-center gap-3 pt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                        <Users size={12} /> {selectedRoom.capacity} pessoas
                                    </span>
                                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded">
                                        {selectedRoom.type || "AULA"}
                                    </span>
                                    {selectedRoom.has_projector == 1 && (
                                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-500 px-2 py-0.5 rounded">
                                            Projetor
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Data e Horas */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Data & Horário</label>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Data <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Início <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                        </div>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={e => setStartTime(e.target.value)}
                                            className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Fim <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                        </div>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                            className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Motivo</label>
                            <Input type="text" placeholder="Ex: Aula de Apoio, Reunião de Equipa..." value={purpose} onChange={setPurpose} icon={AlignLeft} required />
                        </div>

                        {hasConflict && (
                            <div className="flex flex-col gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-sm">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertCircle size={16} className="shrink-0" />
                                    Esta sala já está ocupada nesse horário.
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="pt-1">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                            <Lightbulb size={13} />
                                            Horários livres sugeridos:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => { setStartTime(s.start); setEndTime(s.end); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                >
                                                    <Clock size={11} />
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading} disabled={hasConflict}>
                            <CheckCircle size={18} /> Confirmar Reserva
                        </Button>
                    </form>
                </div>

                {/* ── TIMELINE ── */}
                <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 h-fit">
                    <DayTimeline
                        roomId={roomId || null}
                        date={date || null}
                        startTime={startTime || null}
                        endTime={endTime || null}
                        onConflict={handleConflict}
                    />
                </div>

            </div>
        </Layout>
    );
}