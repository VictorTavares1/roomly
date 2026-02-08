import { useEffect, useState } from "react";
import { Trash2, Clock, MapPin, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext"; // <--- USAR CONTEXT

export default function MyReservations() {
    const { user } = useAuth(); // <--- USER DO CONTEXTO
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            reservationService.getMyReservations(user.id) // <--- USA ID DO CONTEXTO
                .then((data) => setReservations(data))
                .catch((err) => console.error(err));
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm("Tens a certeza que queres cancelar esta reserva?")) return;

        try {
            const res = await reservationService.cancel(id);
            if (res.status === "sucesso") {
                setReservations(reservations.filter((r) => r.id !== id));
            } else {
                alert("Erro: " + res.mensagem);
            }
        } catch (error) { console.error("Erro:", error); }
    };

    return (
        <Layout title="Minhas Reservas">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {reservations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Ainda não tens reservas feitas.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
                            <tr><th className="p-4">Sala</th><th className="p-4">Data / Hora</th><th className="p-4">Motivo</th><th className="p-4 text-center">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reservations.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" /> {reserva.room_name}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-bold text-gray-800">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full mt-1">
                                                <Clock size={12} />
                                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 italic">"{reserva.purpose}"</td>
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