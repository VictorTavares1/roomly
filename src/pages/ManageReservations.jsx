import { useEffect, useState, useCallback } from "react";
import { Trash2, Calendar, Clock, MapPin, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { reservationService } from "../services/api";
import { translateMessage } from "../utils/translations";

export default function ManageReservations() {
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchReservations = useCallback(() => {
        reservationService.getAll()
            .then((data) => setReservations(data))
            .catch((err) => console.error("Erro:", err));
    }, []);

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 10000);
        return () => clearInterval(interval);
    }, [fetchReservations]);

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Atenção Admin: Vais cancelar a reserva de outra pessoa. Confirmas?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await reservationService.cancel(id);
                            if (res.status === "sucesso") {
                                setReservations((prev) => prev.filter((r) => r.id !== id));
                                toast.success("Reserva cancelada com sucesso!");
                            } else {
                                toast.error(translateMessage(res.mensagem));
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
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                    <ShieldCheck size={22} className="text-blue-500" />
                    Gerir Reservas
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    Consulta e cancela reservas de todos os utilizadores.
                </p>
            </div>

            <div className="mb-6">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por nome, sala, motivo..." />
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col gap-3">
                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 dark:text-slate-500 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <Search size={48} className="opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                    </div>
                ) : filteredReservations.map((reserva) => (
                    <div key={reserva.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                    {reserva.user_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{reserva.user_name}</span>
                            </div>
                            <button onClick={() => handleDelete(reserva.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors">
                                <Trash2 size={12} /> Cancelar
                            </button>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin size={13} className="text-gray-400 shrink-0" /> {reserva.room_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-gray-700 dark:text-slate-300">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 italic">"{reserva.purpose}"</p>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors overflow-x-auto">
                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 dark:text-slate-500 flex flex-col items-center gap-4">
                        <Search size={48} className="opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold border-b dark:border-slate-700">
                            <tr>
                                <th className="p-4">Utilizador</th>
                                <th className="p-4">Sala</th>
                                <th className="p-4">Data / Hora</th>
                                <th className="p-4">Motivo</th>
                                <th className="p-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredReservations.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                            {reserva.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        {reserva.user_name}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400" /> {reserva.room_name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-bold">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded w-fit flex items-center gap-1 mt-1">
                                                <Clock size={10} />
                                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-slate-400 italic text-sm">"{reserva.purpose}"</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(reserva.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            <Trash2 size={13} /> Cancelar
                                        </button>
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