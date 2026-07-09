import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, CheckCircle2, Clock, MapPin, User, Wrench, ImageIcon, X, Search, Loader2, CircleDot, Filter, ChevronDown } from "lucide-react";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
import Layout from "../components/Layout";
import { reportService } from "../services/api";

const STATUS = {
    pendente:  { label: "Pendente",  bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-400",   ring: "ring-amber-200 dark:ring-amber-800" },
    resolvido: { label: "Resolvido", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800" },
};

const FILTERS = [
    { key: "todos",     label: "Todos"      },
    { key: "pendente",  label: "Pendentes"  },
    { key: "resolvido", label: "Resolvidos" },
];

const formatDayHeader = (dateStr) => {
    if (!dateStr || dateStr === "unknown") return null;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.getTime() === today.getTime()) return "Hoje";
    if (d.getTime() === yesterday.getTime()) return "Ontem";
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
};

function StatusBadge({ status }) {
    const s = STATUS[status] || STATUS.pendente;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${s.bg} ${s.text} ${s.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

const formatDate = (str) => {
    if (!str) return null;
    const d = new Date(str.includes("T") ? str : str.replace(" ", "T"));
    if (isNaN(d)) return null;
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
};

export default function ManageReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxUrl, setLightboxUrl] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("todos");
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const loadReports = useCallback(async () => {
        try {
            const data = await reportService.getAll();
            setReports(Array.isArray(data) ? data : []);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadReports();
        const interval = setInterval(loadReports, 10000);
        return () => clearInterval(interval);
    }, [loadReports]);

    const handleUpdateStatus = async (id, newStatus) => {
        const label = newStatus === "resolvido" ? "resolvido" : "em curso";
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Marcar este reporte como <strong>{label}</strong>?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        const res = await reportService.updateStatus(id, newStatus);
                        if (res.status === "sucesso") {
                            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
                            toast.success(`Reporte marcado como ${label}!`);
                        }
                    }} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                        Confirmar
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const pendingCount  = reports.filter(r => r.status === "pendente").length;
    const resolvedCount = reports.filter(r => r.status === "resolvido").length;

    const filtered = reports.filter(r => {
        const matchFilter = filter === "todos" || r.status === filter;
        const term = search.toLowerCase();
        const matchSearch = !term ||
            r.room_name?.toLowerCase().includes(term) ||
            r.user_name?.toLowerCase().includes(term) ||
            r.description?.toLowerCase().includes(term);
        return matchFilter && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const groupedPaged = paged.reduce((acc, r) => {
        const day = r.created_at?.slice(0, 10) || "unknown";
        if (!acc[day]) acc[day] = [];
        acc[day].push(r);
        return acc;
    }, {});

    const activeFilterLabel = FILTERS.find(f => f.key === filter)?.label || "Todos";

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                        <Wrench size={22} className="text-orange-500" />
                        Manutenção
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        Acompanha e resolve os problemas reportados pelos utilizadores.
                    </p>
                </div>

                {/* Pesquisa + botão filtro */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Pesquisar por sala, utilizador ou descrição..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 transition-all duration-150"
                        />
                    </div>

                    {/* Dropdown filtro */}
                    <div ref={filterRef} className="relative shrink-0">
                        <button
                            onClick={() => setFilterOpen(v => !v)}
                            className="cursor-pointer relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-150"
                        >
                            <Filter size={14} />
                            Filtro
                            <ChevronDown size={13} className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`} />
                            {filter !== "todos" && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-800" />
                            )}
                        </button>

                        {filterOpen && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden z-20">
                                {FILTERS.map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => { setFilter(f.key); setPage(1); setFilterOpen(false); }}
                                        className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-100 ${
                                            filter === f.key
                                                ? f.key === "todos"
                                                    ? "bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-slate-100 font-semibold"
                                                    : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold"
                                                : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                        }`}
                                    >
                                        {f.label}
                                        {f.key === "pendente"  && pendingCount  > 0 && <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>}
                                        {f.key === "resolvido" && resolvedCount > 0 && <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">{resolvedCount}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 size={24} className="animate-spin text-orange-400" />
                        <p className="text-sm text-gray-400 dark:text-slate-500">A carregar reportes...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <CheckCircle2 size={36} className="text-emerald-300 dark:text-emerald-700" />
                        <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">Nenhum problema reportado</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">Tudo a funcionar normalmente!</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <Search size={28} className="text-gray-200 dark:text-slate-700" />
                        <p className="text-sm text-gray-400 dark:text-slate-500">Nenhum reporte corresponde à pesquisa.</p>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupedPaged).map(([day, dayReports]) => {
                            const dayLabel = formatDayHeader(day);
                            return (
                                <div key={day}>
                                    {dayLabel && (
                                        <div className="px-5 py-2.5 bg-gray-50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700">
                                            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                                {dayLabel}
                                            </span>
                                        </div>
                                    )}
                                    <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
                                        {dayReports.map((report) => (
                            <div
                                key={report.id}
                                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-150 ${
                                    report.status === "resolvido"
                                        ? "opacity-60"
                                        : "hover:bg-gray-50 dark:hover:bg-slate-700/20"
                                }`}
                            >
                                <div className="flex-1 flex flex-col gap-2 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
                                                {report.room_name}
                                            </span>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2 pl-5">
                                        {report.description}
                                    </p>

                                    <div className="flex items-center gap-3 pl-5 flex-wrap">
                                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <User size={11} />
                                            {report.user_name}
                                        </span>
                                        {formatDate(report.created_at) && (
                                            <>
                                                <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
                                                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                                    <Clock size={11} />
                                                    {formatDate(report.created_at)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Imagem + ações */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {report.image_path ? (
                                        <button
                                            type="button"
                                            onClick={() => setLightboxUrl(`${API_BASE}/${report.image_path}`)}
                                            title="Ver imagem"
                                            className="cursor-pointer w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500 transition-colors shrink-0"
                                        >
                                            <img src={`${API_BASE}/${report.image_path}`} alt="Foto do problema" className="w-full h-full object-cover" />
                                        </button>
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                            <ImageIcon size={16} className="text-gray-300 dark:text-slate-600" />
                                        </div>
                                    )}

                                    {report.status === "pendente" && (
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, "resolvido")}
                                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
                                        >
                                            <CheckCircle size={12} /> Marcar Resolvido
                                        </button>
                                    )}
                                </div>
                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {/* Lightbox */}
            {lightboxUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
                    <button
                        className="cursor-pointer absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        onClick={() => setLightboxUrl(null)}
                    >
                        <X size={18} />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Foto do problema"
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </Layout>
    );
}
