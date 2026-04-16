import { useEffect, useState } from "react";
import { Trash2, Clock, MapPin, Pencil, History, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [tab, setTab] = useState("upcoming");
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            reservationService.getMyReservations()
                .then((data) => {
                    const list = Array.isArray(data) ? data : (data.reservations || data.data || []);
                    setReservations(list);
                })
                .catch((err) => console.error(err));
        }
    }, [user]);

    const upcoming = reservations.filter(r => !Number(r.is_past) && r.status !== "cancelada");
    const past = reservations.filter(r => Number(r.is_past) || r.status === "cancelada");

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Tens a certeza que queres cancelar esta reserva?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await reservationService.cancel(id);
                            if (res.status === "sucesso") {
                                setReservations((prev) => prev.filter((r) => r.id !== id));
                                toast.success("Reserva cancelada!");
                            } else {
                                toast.error(res.mensagem || "Erro ao cancelar.");
                            }
                        } catch (error) {
                            console.error("Erro:", error);
                            toast.error("Erro ao cancelar reserva.");
                        }
                    }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">Sim, cancelar</button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">Não</button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const ReservationTable = ({ items, showActions }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
            {items.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Nenhuma reserva encontrada.</div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold border-b dark:border-slate-700">
                        <tr>
                            <th className="p-4">Sala</th>
                            <th className="p-4">Data / Hora</th>
                            <th className="p-4">Motivo</th>
                            <th className="p-4">Estado</th>
                            {showActions && <th className="p-4 text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {items.map((reserva) => (
                            <tr key={reserva.id} className={`transition-colors ${Number(reserva.is_past) ? "opacity-60" : "hover:bg-gray-50 dark:hover:bg-slate-700/50"}`}>
                                <td className="p-4 font-medium text-gray-800 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500 shrink-0" /> {reserva.room_name}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-slate-400">
                                    <div className="flex flex-col text-sm">
                                        <span className="font-bold text-gray-800 dark:text-slate-300">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                        <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 w-fit px-2 py-0.5 rounded-full mt-1">
                                            <Clock size={12} />
                                            {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-slate-400 italic">"{reserva.purpose}"</td>
                                <td className="p-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        reserva.status === "cancelada"
                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            : Number(reserva.is_past)
                                                ? "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    }`}>
                                        {reserva.status === "cancelada" ? "Cancelada" : Number(reserva.is_past) ? "Concluída" : "Confirmada"}
                                    </span>
                                </td>
                                {showActions && (
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => navigate('/edit-reservation', { state: { reservation: reserva } })} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-full transition-all shadow-sm"><Pencil size={18} /></button>
                                            <button onClick={() => handleDelete(reserva.id)} className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 p-2 rounded-full transition-all shadow-sm"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <Layout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200">Minhas Reservas 🗓️</h1>
                <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 gap-1 w-fit">
                    <button
                        onClick={() => setTab("upcoming")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            tab === "upcoming"
                                ? "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 shadow-sm"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <CalendarCheck size={15} />
                        Próximas
                        <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">{upcoming.length}</span>
                    </button>
                    <button
                        onClick={() => setTab("past")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            tab === "past"
                                ? "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 shadow-sm"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <History size={15} />
                        Histórico
                        <span className="text-xs bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">{past.length}</span>
                    </button>
                </div>
            </div>

            <ReservationTable items={tab === "upcoming" ? upcoming : past} showActions={tab === "upcoming"} />
        </Layout>
    );
}