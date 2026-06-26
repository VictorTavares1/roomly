import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2, Clock, MapPin, Pencil, History, CalendarCheck, CalendarDays, Calendar, CalendarPlus, Search, Filter, ChevronDown, QrCode, CheckCircle2, Save, AlignLeft, X } from "lucide-react";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reservationService, roomService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TimeSelect from "../components/TimeSelect";
import DateSelect from "../components/DateSelect";
import { translateMessage } from "../utils/translations";

export default function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [tab, setTab] = useState("upcoming");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const [now, setNow] = useState(new Date());

    const FILTERS = [
        { key: "todos",       label: "Todos"        },
        { key: "AULA",        label: "Aula"         },
        { key: "LABORATÓRIO", label: "Laboratório"  },
        { key: "REUNIÃO",     label: "Reunião"      },
        { key: "AUDITÓRIO",   label: "Auditório"    },
    ];

    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
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

    // Modal de edição
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({ roomId: "", date: "", startTime: "", endTime: "", purpose: "" });
    const [editRooms, setEditRooms] = useState([]);
    const [editLoading, setEditLoading] = useState(false);

    const openEdit = (reserva) => {
        const start = new Date(reserva.start_time);
        const end = new Date(reserva.end_time);
        setEditForm({
            roomId: String(reserva.rooms_id || reserva.room_id || ""),
            date: start.toISOString().slice(0, 10),
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            purpose: reserva.purpose || "",
        });
        setEditModal(reserva);
        if (editRooms.length === 0) roomService.getAll().then(setEditRooms).catch(() => {});
    };

    const closeEdit = () => { setEditModal(null); };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editForm.startTime >= editForm.endTime) {
            toast.error("A hora de fim tem de ser depois do início.");
            return;
        }

        const [sh, sm] = editForm.startTime.split(":").map(Number);
        const [eh, em] = editForm.endTime.split(":").map(Number);
        if ((eh * 60 + em) - (sh * 60 + sm) < 15) {
            toast.error("A reserva deve ter pelo menos 15 minutos de duração.");
            return;
        }

        if (editForm.purpose.trim().length < 3) {
            toast.error("O motivo deve ter pelo menos 3 caracteres.");
            return;
        }

        if (editForm.purpose.trim().length > 200) {
            toast.error("O motivo não pode ter mais de 200 caracteres.");
            return;
        }
        setEditLoading(true);
        try {
            const res = await reservationService.update({
                id: editModal.id,
                rooms_id: editForm.roomId,
                start_time: `${editForm.date} ${editForm.startTime}:00`,
                end_time: `${editForm.date} ${editForm.endTime}:00`,
                purpose: editForm.purpose,
            });
            if (res.status === "sucesso") {
                toast.success("Reserva atualizada com sucesso!");
                fetchReservations();
                closeEdit();
            } else {
                toast.error(translateMessage(res.mensagem) || "Erro ao atualizar reserva.");
            }
        } catch (err) {
            toast.error(translateMessage(err.message) || "Erro ao atualizar reserva.");
        } finally {
            setEditLoading(false);
        }
    };

    // Verifica se a reserva está dentro da janela de check-in (5 min antes até 15 min depois do início)
    const canCheckin = (reserva) => {
        if (reserva.status !== "pendente") return false;
        if (Number(reserva.is_past)) return false;
        const start = new Date(reserva.start_time.replace(" ", "T"));
        const diffMs = now - start;
        const diffMin = diffMs / 60000;
        return diffMin >= -5 && diffMin <= 15;
    };

    const [checkinModal, setCheckinModal] = useState(null); // { reserva }
    const scannerRef = useRef(null);

    const openCheckin = (reserva) => setCheckinModal({ reserva });

    const closeCheckinModal = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {}).finally(() => { scannerRef.current = null; });
        }
        setCheckinModal(null);
    };

    const startQRScanner = useCallback(async () => {
        if (!checkinModal) return;
        try {
            const { Html5Qrcode } = await import("html5-qrcode");
            const scanner = new Html5Qrcode("qr-modal-reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                async (decodedText) => {
                    await scanner.stop();
                    scannerRef.current = null;
                    try {
                        await reservationService.checkin(decodedText);
                        setReservations(prev => prev.map(r =>
                            r.id === checkinModal.reserva.id ? { ...r, status: "confirmada" } : r
                        ));
                        setCheckinModal(null);
                        toast.success(`Check-in confirmado em ${checkinModal.reserva.room_name}!`);
                    } catch (err) {
                        toast.error(err.message || "Erro ao fazer check-in.");
                        setCheckinModal(null);
                    }
                },
                () => {}
            );
        } catch {
            toast.error("Não foi possível aceder à câmara. Verifica as permissões.");
            setCheckinModal(null);
        }
    }, [checkinModal]);

    useEffect(() => {
        if (checkinModal) startQRScanner();
    }, [checkinModal, startQRScanner]);

    const statusStyle = (reserva) => {
        if (reserva.status === "cancelada") return { label: "Cancelada", cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
        if (Number(reserva.is_past)) return { label: "Concluída", cls: "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400" };
        if (reserva.status === "confirmada") return { label: "Confirmada", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
        return { label: "Pendente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
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

    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const allItems = tab === "upcoming" ? upcoming : past;
    const filtered = allItems.filter(r => {
        const matchSearch = !search.trim() ||
            r.room_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.purpose?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filterStatus === "todos" ||
            (r.room_type || "").toUpperCase() === filterStatus;
        return matchSearch && matchFilter;
    });
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
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
                        onClick={() => { setTab("upcoming"); setSearch(""); setFilterStatus("todos"); setPage(1); }}
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
                        onClick={() => { setTab("past"); setSearch(""); setFilterStatus("todos"); setPage(1); }}
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

                {/* Pesquisa + filtro — só no histórico */}
                {tab === "past" && (
                    <div className="flex gap-3 mt-4">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Pesquisar por sala ou motivo..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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
                                {filterStatus !== "todos" && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                                )}
                            </button>
                            {filterOpen && (
                                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden z-20">
                                    {FILTERS.map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => { setFilterStatus(f.key); setPage(1); setFilterOpen(false); }}
                                            className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${
                                                filterStatus === f.key
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
                                        const minutesUntilStart = (start - now) / 60000;
                                        const canEdit = minutesUntilStart >= 15;
                                        const canCancel = minutesUntilStart >= 15;
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
                                                            {canCheckin(reserva) && (
                                                                <button
                                                                    onClick={() => openCheckin(reserva)}
                                                                    title="Fazer check-in por QR Code"
                                                                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
                                                                >
                                                                    <QrCode size={13} /> Check-in
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => canEdit && openEdit(reserva)}
                                                                disabled={!canEdit}
                                                                title={!canEdit ? "Não é possível editar com menos de 15 min de antecedência" : "Editar reserva"}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                    !canEdit
                                                                        ? "bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed"
                                                                        : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                                                }`}
                                                            >
                                                                <Pencil size={13} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => canCancel && handleDelete(reserva.id)}
                                                                disabled={!canCancel}
                                                                title={!canCancel ? "Só é possível cancelar com 15 min de antecedência" : "Cancelar reserva"}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                    !canCancel
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
                                const minutesUntilStart = (start - now) / 60000;
                                        const canEdit = minutesUntilStart >= 15;
                                        const canCancel = minutesUntilStart >= 15;
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
                                            <div className="flex gap-2 pl-5 flex-wrap">
                                                {canCheckin(reserva) && (
                                                    <button
                                                        onClick={() => openCheckin(reserva)}
                                                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                    >
                                                        <QrCode size={12} /> Check-in
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => canEdit && openEdit(reserva)}
                                                    disabled={!canEdit}
                                                    title={!canEdit ? "Não é possível editar com menos de 15 min de antecedência" : "Editar reserva"}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        !canEdit
                                                            ? "bg-gray-100 dark:bg-slate-700 text-gray-300 cursor-not-allowed"
                                                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    }`}
                                                >
                                                    <Pencil size={12} /> Editar
                                                </button>
                                                <button
                                                    onClick={() => canCancel && handleDelete(reserva.id)}
                                                    disabled={!canCancel}
                                                    title={!canCancel ? "Só é possível cancelar com 15 min de antecedência" : "Cancelar reserva"}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        !canCancel
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
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
            {/* Modal de Edição */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeEdit}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                    <Pencil size={15} className="text-blue-500" /> Editar Reserva
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{editModal.room_name}</p>
                            </div>
                            <button onClick={closeEdit} className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {/* Sala */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sala</label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select
                                        value={editForm.roomId}
                                        onChange={e => setEditForm(f => ({ ...f, roomId: e.target.value }))}
                                        className="cursor-pointer w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none"
                                        required
                                    >
                                        {editRooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Data */}
                            <div>
                                <DateSelect
                                    label="Data"
                                    value={editForm.date}
                                    onChange={v => setEditForm(f => ({ ...f, date: v }))}
                                    min={new Date().toISOString().slice(0, 10)}
                                    required
                                />
                            </div>

                            {/* Horas */}
                            <div className="grid grid-cols-2 gap-3">
                                <TimeSelect
                                    label="Hora Início"
                                    value={editForm.startTime}
                                    onChange={v => setEditForm(f => ({ ...f, startTime: v }))}
                                    required
                                />
                                <TimeSelect
                                    label="Hora Fim"
                                    value={editForm.endTime}
                                    onChange={v => setEditForm(f => ({ ...f, endTime: v }))}
                                    min={editForm.startTime || undefined}
                                    required
                                />
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Motivo <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <AlignLeft size={15} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={editForm.purpose}
                                        onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}
                                        placeholder="Ex: Aula de Apoio"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="cursor-pointer flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
                                >
                                    <Save size={14} />
                                    {editLoading ? "A guardar..." : "Guardar Alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Check-in QR */}
            {checkinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeCheckinModal}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                    <QrCode size={16} className="text-emerald-500" /> Check-in
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{checkinModal.reserva.room_name}</p>
                            </div>
                            <button onClick={closeCheckinModal} className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
                        </div>
                        <div className="bg-gray-900 relative">
                            <div id="qr-modal-reader" className="w-full" />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-52 h-52 border-2 border-white/60 rounded-2xl" />
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-400 dark:text-slate-500">Aponta a câmara para o QR Code da sala</p>
                            <button onClick={closeCheckinModal} className="cursor-pointer mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
