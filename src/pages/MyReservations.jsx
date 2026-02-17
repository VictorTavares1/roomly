import { useEffect, useState } from "react";
import { Trash2, Clock, MapPin, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            reservationService.getMyReservations(user.id)
                .then((data) => setReservations(data))
                .catch((err) => console.error(err));
        }
    }, [user]);

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

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200 mb-6">Minhas Reservas 🗓️</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                {reservations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-slate-400">Ainda não tens reservas feitas.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold border-b dark:border-slate-700">
                            <tr><th className="p-4">Sala</th><th className="p-4">Data / Hora</th><th className="p-4">Motivo</th><th className="p-4 text-center">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {reservations.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800 dark:text-slate-300 flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" /> {reserva.room_name}
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-slate-400">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-bold text-gray-800 dark:text-slate-300">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full mt-1">
                                                <Clock size={12} />
                                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-slate-400 italic">"{reserva.purpose}"</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => navigate('/edit-reservation', { state: { reservation: reserva } })} className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-all shadow-sm"><Pencil size={18} /></button>
                                            <button onClick={() => handleDelete(reserva.id)} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-full transition-all shadow-sm"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
}