import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Type, Users, Projector, Save,
    GraduationCap, Building2, Monitor, UsersRound,
    CalendarPlus, AlertTriangle, Clock, CheckCircle2, Wrench,
    Calendar, MapPin, SlidersHorizontal
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import RoomCard from "../components/RoomCard";
import { roomService, reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";
import TimeSelect from "../components/TimeSelect";
import DateSelect from "../components/DateSelect";

function computeWeeklyHoursMap(reservations) {
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const map = {};
    reservations.forEach((r) => {
        if (r.status === "cancelada") return;
        const start = new Date(r.start_time);
        const end = new Date(r.end_time);
        if (start < weekStart || start >= weekEnd) return;
        const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
        const key = r.room_name || r.room_id;
        map[key] = (map[key] || 0) + hours;
    });
    return map;
}

function getRoomStatus(room) {
    if (!room.status) return "DISPONÍVEL";
    const s = room.status.toLowerCase();
    if (s === "em_curso") return "DISPONÍVEL";
    if (s.includes("ocup")) return "OCUPADA";
    if (s.includes("manu")) return "EM MANUTENÇÃO";
    return "DISPONÍVEL";
}

function inferType(room) {
    return room.type ? room.type.toUpperCase() : "AULA";
}

function matchesCapacity(capacity, filter) {
    const cap = Number(capacity);
    if (filter === "small") return cap < 20;
    if (filter === "medium") return cap >= 20 && cap <= 50;
    if (filter === "large") return cap > 50 && cap <= 100;
    if (filter === "xlarge") return cap > 100;
    return true;
}

export default function Rooms() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === "admin";

    const [rooms, setRooms] = useState([]);
    const [weeklyMap, setWeeklyMap] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filtersRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (filtersRef.current && !filtersRef.current.contains(e.target)) setFiltersOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Modal Editar Sala
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [editName, setEditName] = useState("");
    const [editCapacity, setEditCapacity] = useState("");
    const [editProjector, setEditProjector] = useState(false);
    const [editType, setEditType] = useState("AULA");
    const [editLoading, setEditLoading] = useState(false);

    // Modal Ver Detalhes
    const [detailRoom, setDetailRoom] = useState(null);
    const [detailReservations, setDetailReservations] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // Filter input state (what's shown in controls)
    const [searchInput, setSearchInput] = useState("");
    const [typeInput, setTypeInput] = useState("");
    const [capacityInput, setCapacityInput] = useState("");
    const [stateInput, setStateInput] = useState("");

    // Availability filter inputs
    const [dateInput, setDateInput] = useState("");
    const [startTimeInput, setStartTimeInput] = useState("");
    const [endTimeInput, setEndTimeInput] = useState("");

    // Applied filter state (what actually filters)
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [capacityFilter, setCapacityFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");

    // Available rooms from backend (null = not fetched yet / no date filter active)
    const [availableIds, setAvailableIds] = useState(null);
    const [availableRoomsMap, setAvailableRoomsMap] = useState({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTimeStr = new Date().toTimeString().slice(0, 5);

    const fetchRooms = useCallback(() => {
        roomService
            .getAll()
            .then((data) => setRooms(Array.isArray(data) ? data : []))
            .catch((err) => console.error(err));

        reservationService
            .getAll()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setWeeklyMap(computeWeeklyHoursMap(list));
            })
            .catch(() => setWeeklyMap({}));
    }, []);

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 10000);
        return () => clearInterval(interval);
    }, [fetchRooms]);

    // Search filters live; dropdowns applied via button
    useEffect(() => {
        setSearchTerm(searchInput);
    }, [searchInput]);

    const applyFilters = async (overrides = {}) => {
        const t = overrides.type !== undefined ? overrides.type : typeInput;
        const c = overrides.capacity !== undefined ? overrides.capacity : capacityInput;
        const s = overrides.state !== undefined ? overrides.state : stateInput;
        setTypeFilter(t);
        setCapacityFilter(c);
        setStateFilter(s);

        if (dateInput && startTimeInput && endTimeInput) {
            if (startTimeInput >= endTimeInput) {
                toast.error("A hora de fim tem de ser depois da hora de início.");
                return;
            }
            setAvailabilityLoading(true);
            try {
                const data = await roomService.getAvailable(dateInput, startTimeInput, endTimeInput);
                const list = Array.isArray(data) ? data : [];
                const ids = new Set(list.map((r) => String(r.id)));
                const map = {};
                list.forEach((r) => { map[String(r.id)] = r; });
                setAvailableIds(ids);
                setAvailableRoomsMap(map);
            } catch {
                toast.error("Erro ao verificar disponibilidade.");
                setAvailableIds(null);
                setAvailableRoomsMap({});
            } finally {
                setAvailabilityLoading(false);
            }
        } else {
            setAvailableIds(null);
            setAvailableRoomsMap({});
        }
    };

    const openEditModal = (sala) => {
        setEditRoom(sala);
        setEditName(sala.name || "");
        setEditCapacity(String(sala.capacity || ""));
        setEditProjector(sala.has_projector == 1);
        setEditType(sala.type || "AULA");
        setShowEditModal(true);
    };

    const handleEditRoom = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const res = await roomService.update({
                id: editRoom.id,
                name: editName,
                capacity: parseInt(editCapacity, 10),
                has_projector: editProjector ? 1 : 0,
                type: editType,
            });
            if (res.status === "sucesso") {
                toast.success("Sala atualizada com sucesso!");
                setShowEditModal(false);
                const data = await roomService.getAll();
                setRooms(Array.isArray(data) ? data : []);
            } else {
                toast.error(translateMessage(res.mensagem));
            }
        } catch {
            toast.error("Erro ao atualizar sala.");
        } finally {
            setEditLoading(false);
        }
    };

    const openDetailsModal = async (sala) => {
        setDetailRoom(sala);
        setDetailReservations([]);
        setDetailLoading(true);
        try {
            const res = await reservationService.getByRoom(sala.id);
            setDetailReservations(Array.isArray(res) ? res : []);
        } catch {
            setDetailReservations([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const hasActiveFilters = typeFilter || capacityFilter || stateFilter || availableIds !== null;

    const clearFilters = () => {
        setSearchInput("");
        setTypeInput("");
        setCapacityInput("");
        setStateInput("");
        setDateInput("");
        setStartTimeInput("");
        setEndTimeInput("");
        setSearchTerm("");
        setTypeFilter("");
        setCapacityFilter("");
        setStateFilter("");
        setAvailableIds(null);
        setAvailableRoomsMap({});
    };

    const filteredRooms = useMemo(() => {
        return rooms.filter((sala) => {
            if (searchTerm && !sala.name.toLowerCase().includes(searchTerm.toLowerCase()))
                return false;
            if (typeFilter && inferType(sala) !== typeFilter) return false;
            if (capacityFilter && !matchesCapacity(sala.capacity, capacityFilter))
                return false;
            if (stateFilter && getRoomStatus(sala) !== stateFilter) return false;
            if (availableIds !== null && !availableIds.has(String(sala.id))) return false;
            return true;
        });
    }, [rooms, searchTerm, typeFilter, capacityFilter, stateFilter, availableIds]);

    // Stats from all rooms
    const stats = useMemo(() => {
        const total = rooms.length;
        const disponiveis = rooms.filter((r) => getRoomStatus(r) === "DISPONÍVEL").length;
        const manutencao = rooms.filter((r) => getRoomStatus(r) === "EM MANUTENÇÃO").length;
        return { total, disponiveis, manutencao };
    }, [rooms]);

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium">Tens a certeza que queres remover esta sala?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    const res = await roomService.delete(id);
                                    if (res.status === "sucesso") {
                                        setRooms((prev) => prev.filter((s) => s.id !== id));
                                        toast.success("Sala removida com sucesso!");
                                    } else {
                                        toast.error(translateMessage(res.mensagem));
                                    }
                                } catch {
                                    toast.error("Erro ao remover sala.");
                                }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                        >
                            Remover
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ),
            { duration: 10000 }
        );
    };

    const chipBase = "flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none";
    const chipIdle = "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500 hover:text-gray-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800";
    const chipActive = "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";

    return (
        <Layout>
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                        Salas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        {isAdmin
                            ? "Gere o catálogo de espaços disponíveis para reserva"
                            : "Encontra o espaço certo para a tua aula ou reunião"}
                    </p>
                </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 py-3 mb-5 flex flex-col gap-3">

                {/* Linha principal: pesquisa + botão filtros */}
                <div className="flex gap-2 items-center">
                    <div className="flex-1 flex items-center gap-3 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-gray-50/50 dark:bg-slate-700/30">
                        <Search size={15} className="text-gray-400 dark:text-slate-500 shrink-0" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Pesquisar sala por nome..."
                            className="bg-transparent text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none flex-1"
                        />
                        {searchInput && (
                            <button onClick={() => setSearchInput("")} className="text-gray-300 hover:text-gray-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Botão Filtros */}
                    <div className="relative" ref={filtersRef}>
                        <button
                            onClick={() => setFiltersOpen(o => !o)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                                ${(typeFilter || capacityFilter || stateFilter)
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                                }`}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {(typeFilter || capacityFilter || stateFilter) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                        </button>

                        {/* Dropdown */}
                        {filtersOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4">

                                {/* Tipo */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-2">Tipo de sala</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["AUDITÓRIO","REUNIÃO","LABORATÓRIO","AULA"].map(t => {
                                            const next = typeInput === t ? "" : t;
                                            const label = t === "AUDITÓRIO" ? "Auditório" : t === "REUNIÃO" ? "Reunião" : t === "LABORATÓRIO" ? "Laboratório" : "Aula";
                                            return (
                                                <button key={t} onClick={() => { setTypeInput(next); applyFilters({ type: next }); }}
                                                    className={`${chipBase} ${typeInput === t ? chipActive : chipIdle}`}>
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Capacidade */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-2">Capacidade</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { value: "small", label: "Até 20" },
                                            { value: "medium", label: "20–50" },
                                            { value: "large", label: "50–100" },
                                            { value: "xlarge", label: "+100" },
                                        ].map(c => {
                                            const next = capacityInput === c.value ? "" : c.value;
                                            return (
                                                <button key={c.value} onClick={() => { setCapacityInput(next); applyFilters({ capacity: next }); }}
                                                    className={`${chipBase} ${capacityInput === c.value ? chipActive : chipIdle}`}>
                                                    <Users size={11} /> {c.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Estado */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 mb-2">Estado</p>
                                    <div className="flex gap-1.5">
                                        {(() => {
                                            const next = stateInput === "EM MANUTENÇÃO" ? "" : "EM MANUTENÇÃO";
                                            return (
                                                <button onClick={() => { setStateInput(next); applyFilters({ state: next }); }}
                                                    className={`${chipBase} ${stateInput === "EM MANUTENÇÃO" ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : chipIdle}`}>
                                                    Em Manutenção
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Footer */}
                                {(typeFilter || capacityFilter || stateFilter) && (
                                    <button onClick={() => { clearFilters(); setFiltersOpen(false); }}
                                        className="w-full text-xs font-medium text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-1">
                                        <X size={11} /> Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disponibilidade */}
                <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                        <Calendar size={11} /> Disponível em
                    </span>
                    <DateSelect value={dateInput} min={todayStr} onChange={(val) => { setDateInput(val); setStartTimeInput(""); setEndTimeInput(""); }} />
                    <TimeSelect value={startTimeInput} onChange={setStartTimeInput} min={dateInput === todayStr ? nowTimeStr : undefined} />
                    <span className="text-gray-300 dark:text-slate-600 text-xs">–</span>
                    <TimeSelect value={endTimeInput} onChange={setEndTimeInput} min={startTimeInput || undefined} />

                    {availableIds !== null && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 size={11} />
                            {filteredRooms.length} disponíve{filteredRooms.length !== 1 ? "is" : "l"}
                        </span>
                    )}

                    <button onClick={applyFilters} disabled={availabilityLoading}
                        className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
                        {availabilityLoading
                            ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> A verificar...</>
                            : <><Search size={11} /> Pesquisar</>
                        }
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 mb-6 text-sm flex-wrap">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-slate-500" />
                    <span className="font-semibold">{stats.total}</span> Total
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-semibold">{stats.disponiveis}</span> Disponíveis
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-semibold">{stats.manutencao}</span> Em Manutenção
                </span>
            </div>

            {/* Room grid */}
            {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((sala) => (
                        <RoomCard
                            key={sala.id}
                            room={availableIds !== null && availableRoomsMap[String(sala.id)] ? availableRoomsMap[String(sala.id)] : sala}
                            weeklyHours={
                                weeklyMap != null
                                    ? (weeklyMap[sala.name] ?? weeklyMap[sala.id] ?? 0)
                                    : null
                            }
                            isAdmin={isAdmin}
                            onViewDetails={(sala) => openDetailsModal(sala)}
                            onEdit={() => openEditModal(sala)}
                            onDelete={() => handleDelete(sala.id)}
                            availabilityDate={availableIds !== null ? dateInput : ""}
                            availabilityStart={availableIds !== null ? startTimeInput : ""}
                            availabilityEnd={availableIds !== null ? endTimeInput : ""}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500">
                    <MapPin size={36} className="opacity-20" />
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Nenhuma sala encontrada.</p>
                    <p className="text-xs">Tenta ajustar os filtros ou limpa a pesquisa.</p>
                </div>
            )}

            {/* ── Modal Ver Detalhes ── */}
            {detailRoom && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setDetailRoom(null)}
                >
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-fade-in-down max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        {(() => {
                            const s = (detailRoom.status || "").toLowerCase();
                            const status = s.includes("ocup") ? "OCUPADA" : s.includes("manu") ? "EM MANUTENÇÃO" : "DISPONÍVEL";
                            const statusBadge = {
                                "DISPONÍVEL": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                "OCUPADA": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                                "EM MANUTENÇÃO": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            }[status];
                            const statusDot = { "DISPONÍVEL": "bg-green-500", "OCUPADA": "bg-orange-500", "EM MANUTENÇÃO": "bg-red-500" }[status];

                            const nameLower = (detailRoom.name || "").toLowerCase();
                            let TypeIcon = GraduationCap, typeBg = "bg-emerald-700", typeLabel = "Sala de Aula";
                            if (nameLower.includes("audit")) { TypeIcon = Building2; typeBg = "bg-indigo-800"; typeLabel = "Auditório"; }
                            else if (nameLower.includes("reuni") || nameLower.includes("conferen")) { TypeIcon = UsersRound; typeBg = "bg-blue-700"; typeLabel = "Sala de Reunião"; }
                            else if (nameLower.includes("lab") || nameLower.includes("inform") || nameLower.includes("quím")) { TypeIcon = Monitor; typeBg = "bg-cyan-800"; typeLabel = "Laboratório"; }

                            const WEEKLY_MAX = 50;
                            const wh = weeklyMap != null ? Math.min((weeklyMap[detailRoom.id] || 0), WEEKLY_MAX) : 0;
                            const canReserve = status === "DISPONÍVEL";

                            return <>
                                {/* Top bar */}
                                <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${typeBg} flex items-center justify-center shrink-0 shadow`}>
                                            <TypeIcon size={26} className="text-white/90" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{detailRoom.name}</h2>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">{typeLabel}</span>
                                            </div>
                                            <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setDetailRoom(null)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 p-6 pb-4">
                                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Users size={13} className="text-blue-500" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Capacidade</p>
                                        </div>
                                        <p className="text-2xl font-black text-gray-800 dark:text-slate-100">{detailRoom.capacity ?? "—"}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500">pessoas</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Clock size={13} className="text-emerald-500" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Uso Semanal</p>
                                        </div>
                                        <p className="text-xl font-black text-gray-800 dark:text-slate-100">
                                            <span className="text-blue-600 dark:text-blue-400">{Math.round(wh * 10) / 10}h</span>
                                            <span className="text-sm font-normal text-gray-400 dark:text-slate-500"> / {WEEKLY_MAX}h</span>
                                        </p>
                                        <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((wh / WEEKLY_MAX) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Equipamentos */}
                                {detailRoom.has_projector == 1 && (
                                    <div className="px-6 pb-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Equipamentos</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                <Projector size={12} /> Projetor
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Próximas reservas */}
                                <div className="px-6 pb-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Próximas Reservas</p>
                                    {detailLoading ? (
                                        <p className="text-sm text-gray-400 dark:text-slate-500">A carregar...</p>
                                    ) : detailReservations.length === 0 ? (
                                        <p className="text-sm text-gray-400 dark:text-slate-500 italic">Sem reservas agendadas.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {detailReservations.map((r) => {
                                                const start = new Date(r.start_time);
                                                const end = new Date(r.end_time);
                                                const isNow = new Date() >= start && new Date() <= end;
                                                const fmt = (d) => d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
                                                const dayFmt = start.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" });
                                                return (
                                                    <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isNow ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20" : "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40"}`}>
                                                        <span className={`w-2 h-2 rounded-full shrink-0 ${isNow ? "bg-orange-500" : "bg-blue-500"}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">{r.user_name}</p>
                                                            <p className="text-xs text-gray-400 dark:text-slate-500">{dayFmt} · {fmt(start)} – {fmt(end)}</p>
                                                        </div>
                                                        {isNow && <span className="text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0">Agora</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Footer actions */}
                                <div className="flex items-center gap-2 p-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex-wrap">
                                    <button
                                        onClick={() => { setDetailRoom(null); navigate("/report-issue", { state: { roomId: detailRoom.id, roomName: detailRoom.name } }); }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <AlertTriangle size={13} /> Reportar Problema
                                    </button>
                                    <div className="flex-1" />
                                    {isAdmin && (
                                        <button
                                            onClick={() => { setDetailRoom(null); openEditModal(detailRoom); }}
                                            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Editar Sala
                                        </button>
                                    )}
                                </div>
                            </>;
                        })()}
                    </div>
                </div>
            )}

            {/* ── Modal Editar Sala ── */}
            {showEditModal && editRoom && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
                >
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-fade-in-down">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Editar Sala</h2>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{editRoom.name}</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEditRoom} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                    Nome da Sala <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/60 text-sm text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                    Lotação Máxima <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={editCapacity}
                                        onChange={(e) => setEditCapacity(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/60 text-sm text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Tipo de Sala */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                    Tipo de Sala <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/60 text-sm text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                >
                                    <option value="AULA">Sala de Aula</option>
                                    <option value="LABORATÓRIO">Laboratório</option>
                                    <option value="REUNIÃO">Sala de Reunião</option>
                                    <option value="AUDITÓRIO">Auditório</option>
                                </select>
                            </div>

                            <div
                                onClick={() => setEditProjector((v) => !v)}
                                className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/60 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors select-none"
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    editProjector ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-800"
                                }`}>
                                    {editProjector && <Projector size={12} className="text-white" />}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                    Tem Projetor Disponível?
                                </span>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-600 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    <Save size={15} />
                                    {editLoading ? "A guardar..." : "Guardar Alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </Layout>
    );
}
