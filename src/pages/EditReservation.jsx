import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, AlignLeft, Save, ArrowLeft, Pencil, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { roomService, reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

export default function EditReservation() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const reservation = location.state?.reservation;

    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!reservation) {
            navigate("/my-reservations", { replace: true });
            return;
        }
        // Apenas o dono da reserva ou admin pode editar
        if (reservation.user_id !== user?.id && user?.role !== "admin") {
            navigate("/my-reservations", { replace: true });
            return;
        }
        roomService.getAll().then(setRooms).catch(console.error);
    }, [reservation, user, navigate]);

    useEffect(() => {
        if (!reservation) return;
        const start = new Date(reservation.start_time);
        const end = new Date(reservation.end_time);

        setRoomId(String(reservation.rooms_id || reservation.room_id || ""));
        setDate(start.toISOString().slice(0, 10));
        setStartTime(start.toTimeString().slice(0, 5));
        setEndTime(end.toTimeString().slice(0, 5));
        setPurpose(reservation.purpose || "");
    }, [reservation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (startTime >= endTime) {
            toast.error("A hora de fim tem de ser depois do início.");
            setLoading(false);
            return;
        }

        try {
            const res = await reservationService.update({
                id: reservation.id,
                rooms_id: roomId,
                start_time: `${date} ${startTime}:00`,
                end_time: `${date} ${endTime}:00`,
                purpose
            });

            if (res.status === "sucesso") {
                toast.success("Reserva atualizada com sucesso!");
                navigate("/my-reservations");
            } else {
                toast.error(translateMessage(res.mensagem) || "Erro ao atualizar reserva.");
            }
        } catch (err) {
            console.error("Erro:", err);
            toast.error(translateMessage(err.message) || "Erro ao atualizar reserva. Verifica se a sala não está ocupada nesse horário.");
        } finally {
            setLoading(false);
        }
    };

    if (!reservation) return null;

    return (
        <Layout>
            <div className="mb-6">
                <button
                    onClick={() => navigate("/my-reservations")}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    <ArrowLeft size={18} /> Voltar às Minhas Reservas
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200 mb-8 flex items-center gap-3"><Pencil size={26} /> Editar Reserva</h1>

            <div className="max-w-xl">
                <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Sala</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={20} />
                                <select
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                                    required
                                >
                                    {rooms.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} (Cap: {r.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input label="Data" type="date" value={date} onChange={setDate} icon={Calendar} required />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Hora Início" type="time" value={startTime} onChange={setStartTime} icon={Clock} required />
                            <Input label="Hora Fim" type="time" value={endTime} onChange={setEndTime} icon={Clock} required />
                        </div>

                        <Input label="Motivo" type="text" placeholder="Ex: Aula de Apoio" value={purpose} onChange={setPurpose} icon={AlignLeft} required />

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/my-reservations")} className="flex-1">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
                                <Save size={18} /> Guardar Alterações
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
