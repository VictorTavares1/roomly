import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2, Calendar, Clock, MapPin, Search, ShieldCheck, Filter, ChevronDown } from "lucide-react";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";
import { translateMessage } from "../utils/translations";

export default function ManageReservations() {
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("todos");
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;
    const filterRef = useRef(null);

    const FILTERS = [
        { key: "todos",    label: "Todos"    },
        { key: "futuras",  label: "Futuras"  },
        { key: "passadas", label: "Passadas" },
    ];

    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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

    const now = new Date();
    const filteredReservations = reservations.filter((reserva) => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
            reserva.user_name.toLowerCase().includes(term) ||
            reserva.room_name.toLowerCase().includes(term) ||
            reserva.purpose.toLowerCase().includes(term) ||
            reserva.start_time.includes(term);
        const start = new Date(reserva.start_time);
        const matchFilter =
            filter === "todos" ? true :
            filter === "futuras" ? start >= now :
            start < now;
        return matchSearch && matchFilter;
    });
    const totalPages = Math.ceil(filteredReservations.length / PER_PAGE);
    const pagedReservations = filteredReservations.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        placeholder="Pesquisar por nome, sala, motivo..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>

                <div ref={filterRef} className="relative shrink-0">
                    <button
                        onClick={() => setFilterOpen(v => !v)}
                        className="cursor-pointer relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-150"
                    >
                        <Filter size={14} />
                        Filtro
                        <ChevronDown size={13} className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`} />
                        {filter !== "todos" && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                        )}
                    </button>

                    {filterOpen && (
                        <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden z-20">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => { setFilter(f.key); setPage(1); setFilterOpen(false); }}
                                    className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${
                                        filter === f.key
                                            ? "bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-slate-100 font-semibold"
                                            : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col gap-3">
                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 dark:text-slate-500 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <Search size={48} className="opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                    </div>
                ) : pagedReservations.map((reserva) => (
                    <div key={reserva.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                    {reserva.user_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{reserva.user_name}</span>
                            </div>
                            {new Date(reserva.end_time) > new Date() && reserva.status !== 'cancelada' && (
                                <button onClick={() => handleDelete(reserva.id)} title="Cancelar reserva"
                                    className="cursor-pointer p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            )}
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
                        <p className="text-xs text-gray-400 dark:text-slate-500">"{reserva.purpose}"</p>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 dark:text-slate-500 flex flex-col items-center gap-4">
                        <Search size={48} className="opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Utilizador</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Sala</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Data / Hora</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Motivo</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/60">
                            {pagedReservations.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                                                {reserva.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            {reserva.user_name}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} className="text-gray-400 shrink-0" /> {reserva.room_name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-bold text-gray-700 dark:text-slate-300">{new Date(reserva.start_time).toLocaleDateString('pt-PT')}</span>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded w-fit flex items-center gap-1 mt-1">
                                                <Clock size={10} />
                                                {new Date(reserva.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.end_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 text-sm">"{reserva.purpose}"</td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end">
                                            {new Date(reserva.end_time) > new Date() && reserva.status !== 'cancelada' && (
                                                <button onClick={() => handleDelete(reserva.id)} title="Cancelar reserva"
                                                    className="cursor-pointer p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
        </Layout>
    );
}