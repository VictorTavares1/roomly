import { useEffect, useState } from "react";
import { Trash2, Calendar, Clock, MapPin, Search } from "lucide-react";
import Layout from "../components/Layout"; // <--- NOVO
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import { reservationService } from "../services/api";
import { translateMessage } from "../utils/translations";

export default function ManageReservations() {
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = () => {
        reservationService.getAll()
            .then((data) => setReservations(data))
            .catch((err) => console.error("Erro:", err));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Atenção Admin: Vais cancelar a reserva de outra pessoa. Confirmas?")) return;

        try {
            const res = await reservationService.cancel(id);
            if (res.status === "sucesso") {
                setReservations((prev) => prev.filter((r) => r.id !== id));
            } else {
                alert("Erro: " + translateMessage(res.mensagem));
            }
        } catch (error) { console.error("Erro:", error); }
    };

    const filteredReservations = reservations.filter((reserva) => {
        const term = searchTerm.toLowerCase();
        return (
            reserva.user_name.toLowerCase().includes(term) ||
            reserva.room_name.toLowerCase().includes(term) ||
            reserva.purpose.toLowerCase().includes(term) ||
            reserva.start_time.includes(term)
        );
    });

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerir Todas as Reservas 👮‍♂️</h1>

            <div className="mb-6">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por nome, sala, motivo..." />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                        <Search size={48} className="opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
                            <tr>
                                <th className="p-4">Utilizador</th>
                                <th className="p-4">Sala</th>
                                <th className="p-4">Data / Hora</th>
                                <th className="p-4">Motivo</th>
                                <th className="p-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReservations.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {reserva.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        {reserva.user_name}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400" /> {reserva.room_name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-bold">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit flex items-center gap-1 mt-1">
                                                <Clock size={10} />
                                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 italic text-sm">"{reserva.purpose}"</td>
                                    <td className="p-4 text-center">
                                        <Button variant="danger" onClick={() => handleDelete(reserva.id)} className="!p-2 !shadow-sm">
                                            <Trash2 size={16} />
                                        </Button>
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