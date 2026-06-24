import { useEffect, useState, useCallback } from "react";
import { Trash2, Clock, MapPin, Pencil, History, CalendarCheck, CalendarDays, Calendar, CalendarPlus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [tab, setTab] = useState("upcoming");
    const [search, setSearch] = useState("");
    const [now, setNow] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const fetchReservations = useCallback(() => {
        if (user?.id) {
            reservationService.getMyReservations()
                .then((data) => {
                    const list = Array.isArray(data) ? data : (data.reservations || data.data || []);
                    setReservations(list);
                })
                .catch((err) => console.error(err));
        }
    }, [user]);

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 10000);
        return () => clearInterval(interval);
    }, [fetchReservations]);

    const isPast = (r) => {
        if (r.status === "cancelada") return true;
        if (Number(r.is_past)) return true;
        const end = new Date(r.end_time.replace(" ", "T"));
        return end <= now;
    };

    const upcoming = reservations.filter(r => !isPast(r));
    const past = reservations.filter(r => isPast(r));

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
                                setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelada" } : r));
                                toast.success("Reserva cancelada!");
                            } else {
                                toast.error(res.mensagem || "Erro ao cancelar.");
                            }
                        } catch {
                            toast.error("Erro ao cancelar reserva.");
                        }
                    }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
                        Sim, cancelar
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">
                        Não
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const statusStyle = (reserva) => {
        if (reserva.status === "cancelada") return { label: "Cancelada", cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
        if (Number(reserva.is_past)) return { label: "Concluída", cls: "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400" };
        const start = new Date(reserva.start_time.replace(" ", "T"));
        if (now >= start) return { label: "Em curso", cls: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
        return { label: "Confirmada", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    };

    const EmptyState = ({ isUpcoming }) => (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
                <Calendar size={28} className="text-gray-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
                    {isUpcoming ? "Nenhuma reserva agendada" : "Sem histórico de reservas"}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {isUpcoming ? "As tuas próximas reservas aparecerão aqui." : "As reservas concluídas e canceladas aparecerão aqui."}
                </p>
            </div>
        </div>
    );

    const allItems = tab === "upcoming" ? upcoming : past;
    const items = search.trim()
        ? allItems.filter(r =>
            r.room_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.purpose?.toLowerCase().includes(search.toLowerCase())
        )
        : allItems;
    const showActions = tab === "upcoming";

    const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

    // Agrupa por data (YYYY-MM-DD)
    const groupedItems = items.reduce((acc, r) => {
        const day = r.start_time?.slice(0, 10) || "unknown";
        if (!acc[day]) acc[day] = [];
        acc[day].push(r);
        return acc;
    }, {});

    const formatDayHeader = (dateStr) => {
        if (dateStr === "unknown") return "Data desconhecida";
        const d = new Date(dateStr + "T00:00:00");
        const today = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (d.getTime() === today.getTime()) return "Hoje";
        if (d.getTime() === yesterday.getTime()) return "Ontem";
        return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
    };

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                            <CalendarDays size={22} className="text-blue-500" />
                            Minhas Reservas
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                            Os teus agendamentos de espaços num só lugar.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/rooms")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors w-fit"
                    >
                        <CalendarPlus size={15} /> Nova Reserva
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-slate-700 gap-1">
                    <button
                        onClick={() => { setTab("upcoming"); setSearch(""); }}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                            tab === "upcoming"
                                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <CalendarCheck size={15} />
                        Próximas
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                            tab === "upcoming"
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}>
                            {upcoming.length}
                        </span>
                    </button>
                    <button
                        onClick={() => { setTab("past"); setSearch(""); }}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                            tab === "past"
                                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <History size={15} />
                        Histórico
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                            tab === "past"
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}>
                            {past.length}
                        </span>
                    </button>
                </div>

                {/* Pesquisa — só no histórico */}
                {tab === "past" && (
                    <div className="relative mt-4">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquisar por sala ou motivo..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden ${tab === "past" ? "mt-4" : ""}`}>
                {items.length === 0 ? (
                    <EmptyState isUpcoming={tab === "upcoming"} />
                ) : (
                    <>
                        {/* Tabela — desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Sala</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Data / Hora</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Motivo</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Estado</th>
                                        {showActions && <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedItems).map(([day, dayItems]) => (
                                        <>
                                            <tr key={`group-${day}`}>
                                                <td colSpan={showActions ? 5 : 4} className="px-5 pt-5 pb-2">
                                                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                                        {formatDayHeader(day)}
                                                    </span>
                                                </td>
                                            </tr>
                                            {dayItems.map((reserva) => {
                                        const { label, cls } = statusStyle(reserva);
                                        const start = new Date(reserva.start_time.replace(" ", "T"));
                                        const isOngoing = now >= start && !Number(reserva.is_past) && reserva.status !== "cancelada";
                                        return (
                                            <tr key={reserva.id} className={`border-t border-gray-50 dark:border-slate-700/60 transition-colors ${Number(reserva.is_past) || reserva.status === "cancelada" ? "opacity-60" : "hover:bg-gray-50 dark:hover:bg-slate-700/30"}`}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-blue-500 shrink-0" />
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{reserva.room_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                                        <Clock size={10} />
                                                        {new Date(reserva.start_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} – {new Date(reserva.end_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-gray-600 dark:text-slate-300 max-w-[200px] truncate">
                                                    {capitalize(reserva.purpose)}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                                        {label}
                                                    </span>
                                                </td>
                                                {showActions && (
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => !isOngoing && navigate("/edit-reservation", { state: { reservation: reserva } })}
                                                                disabled={isOngoing}
                                                                title={isOngoing ? "Não é possível editar uma reserva em curso" : "Editar reserva"}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                    isOngoing
                                                                        ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed"
                                                                        : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                                                }`}
                                                            >
                                                                <Pencil size={13} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => !isOngoing && handleDelete(reserva.id)}
                                                                disabled={isOngoing}
                                                                title={isOngoing ? "Não é possível cancelar uma reserva em curso" : "Cancelar reserva"}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                    isOngoing
                                                                        ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed"
                                                                        : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                                                                }`}
                                                            >
                                                                <Trash2 size={13} />
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards — mobile */}
                        <div className="md:hidden">
                            {Object.entries(groupedItems).map(([day, dayItems]) => (
                                <div key={`m-group-${day}`}>
                                    <div className="px-4 pt-4 pb-1">
                                        <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                            {formatDayHeader(day)}
                                        </span>
                                    </div>
                                    {dayItems.map((reserva) => {
                                const { label, cls } = statusStyle(reserva);
                                const start = new Date(reserva.start_time.replace(" ", "T"));
                                const isOngoing = now >= start && !Number(reserva.is_past) && reserva.status !== "cancelada";
                                return (
                                    <div key={reserva.id} className={`p-4 border-t border-gray-50 dark:border-slate-700/60 flex flex-col gap-3 ${Number(reserva.is_past) || reserva.status === "cancelada" ? "opacity-60" : ""}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-blue-500 shrink-0" />
                                                <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{reserva.room_name}</span>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>
                                                {label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 pl-5">
                                            <span className="font-semibold text-gray-700 dark:text-slate-300">
                                                {new Date(reserva.start_time).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {new Date(reserva.start_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} – {new Date(reserva.end_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 pl-5">{capitalize(reserva.purpose)}</p>
                                        {showActions && (
                                            <div className="flex gap-2 pl-5">
                                                <button
                                                    onClick={() => !isOngoing && navigate("/edit-reservation", { state: { reservation: reserva } })}
                                                    disabled={isOngoing}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        isOngoing
                                                            ? "bg-gray-100 dark:bg-slate-700 text-gray-300 cursor-not-allowed"
                                                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    }`}
                                                >
                                                    <Pencil size={12} /> Editar
                                                </button>
                                                <button
                                                    onClick={() => !isOngoing && handleDelete(reserva.id)}
                                                    disabled={isOngoing}
                                                    title={isOngoing ? "Não é possível cancelar uma reserva em curso" : "Cancelar reserva"}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        isOngoing
                                                            ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed"
                                                            : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                                                    }`}
                                                >
                                                    <Trash2 size={12} /> Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
