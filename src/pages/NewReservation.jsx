import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, AlignLeft, CheckCircle, CalendarPlus, Users, AlertCircle, Lightbulb, Search, ChevronDown, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import DayTimeline from "../components/DayTimeline";
import { roomService, reservationService } from "../services/api";
import TimeSelect from "../components/TimeSelect";
import DateSelect from "../components/DateSelect";
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
    const [date, setDate] = useState(preselectedDate || new Date().toISOString().slice(0, 10));
    const [startTime, setStartTime] = useState(preselectedStart);
    const [endTime, setEndTime] = useState(preselectedEnd);
    const [purpose, setPurpose] = useState("");

    const [loading, setLoading] = useState(false);
    const [hasConflict, setHasConflict] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const [roomSearch, setRoomSearch] = useState("");
    const [roomDropOpen, setRoomDropOpen] = useState(false);
    const roomRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (roomRef.current && !roomRef.current.contains(e.target)) setRoomDropOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

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

        if (purpose.trim().length < 3) {
            toast.error("O motivo deve ter pelo menos 3 caracteres.");
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
                <button
                    onClick={() => navigate("/rooms")}
                    className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors mb-3"
                >
                    <ChevronLeft size={16} /> Voltar às Salas
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2.5">
                    <CalendarPlus size={24} className="text-blue-500" /> Nova Reserva
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Preenche os detalhes e confirma a disponibilidade antes de reservar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── FORMULÁRIO ── */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-4">

                            {/* Sala */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sala</label>
                                <div className="relative" ref={roomRef}>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer"
                                        onClick={() => setRoomDropOpen(o => !o)}>
                                        <Search size={13} className="text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={roomDropOpen ? roomSearch : (selectedRoom ? selectedRoom.name : "")}
                                            onChange={e => { setRoomSearch(e.target.value); setRoomDropOpen(true); }}
                                            onFocus={() => { setRoomSearch(""); setRoomDropOpen(true); }}
                                            placeholder="Pesquisar sala..."
                                            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder-gray-400 min-w-0"
                                        />
                                        <ChevronDown size={13} className={`text-gray-400 shrink-0 transition-transform ${roomDropOpen ? "rotate-180" : ""}`} />
                                    </div>
                                    {roomDropOpen && (
                                        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {rooms.filter(r => r.name.toLowerCase().includes(roomSearch.toLowerCase())).map(room => (
                                                <li key={room.id}
                                                    onMouseDown={() => { setRoomId(String(room.id)); setRoomDropOpen(false); setRoomSearch(""); }}
                                                    className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors ${String(roomId) === String(room.id) ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
                                                    <span className="font-medium">{room.name}</span>
                                                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0 ml-2">cap. {room.capacity}</span>
                                                </li>
                                            ))}
                                            {rooms.filter(r => r.name.toLowerCase().includes(roomSearch.toLowerCase())).length === 0 && (
                                                <li className="px-4 py-3 text-sm text-gray-400 text-center">Nenhuma sala encontrada</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                {selectedRoom && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Users size={11} /> {selectedRoom.capacity} pessoas
                                        </span>
                                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded">
                                            {selectedRoom.type || "AULA"}
                                        </span>
                                        {selectedRoom.has_projector == 1 && (
                                            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-500 px-2 py-0.5 rounded">Projetor</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Data & Horário */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Data & Horário</label>
                                <DateSelect label="Data" value={date} onChange={setDate} required min={new Date().toISOString().slice(0, 10)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <TimeSelect label="Início" value={startTime} onChange={setStartTime} required />
                                    <TimeSelect label="Fim" value={endTime} onChange={setEndTime} required min={startTime || undefined} />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Motivo */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Motivo</label>
                                <Input type="text" placeholder="Ex: Aula de Apoio, Reunião de Equipa..." value={purpose} onChange={setPurpose} icon={AlignLeft} required max={200} />
                            </div>

                            {hasConflict && (
                                <div className="flex flex-col gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-sm">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertCircle size={15} className="shrink-0" />
                                        Esta sala já está ocupada nesse horário.
                                    </div>
                                    {suggestions.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                                                <Lightbulb size={12} /> Horários livres sugeridos:
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {suggestions.map((s, i) => (
                                                    <button key={i} type="button"
                                                        onClick={() => { setStartTime(s.start); setEndTime(s.end); }}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors">
                                                        <Clock size={10} /> {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={loading} disabled={hasConflict}>
                                <CheckCircle size={17} /> Confirmar Reserva
                            </Button>
                        </div>
                    </form>
                </div>

                {/* ── TIMELINE ── */}
                <div className="col-span-1 lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 md:p-6 h-fit overflow-hidden">
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