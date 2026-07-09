import { useState, useEffect, useCallback, useRef } from "react";
import Pagination from "../components/Pagination";
import { useLocation } from "react-router-dom";
import {
    AlertTriangle, Send, MapPin, CheckCircle, Clock,
    ClipboardList, Wrench, ImagePlus, X, ChevronDown,
    Loader2, TriangleAlert, Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { roomService, reportService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

const STATUS = {
    pendente:  { label: "Pendente",  bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-400",   ring: "ring-amber-200 dark:ring-amber-800" },
    resolvido: { label: "Resolvido", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800" },
};

const formatDate = (str) => {
    if (!str) return null;
    const d = new Date(str.includes("T") ? str : str.replace(" ", "T"));
    if (isNaN(d)) return null;
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
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

function RoomCombobox({ rooms, value, onChange }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = rooms.find(r => String(r.id) === String(value));
    const filtered = query.trim()
        ? rooms.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
        : rooms;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const select = (room) => {
        onChange(String(room.id));
        setQuery("");
        setOpen(false);
    };

    const clear = (e) => {
        e.stopPropagation();
        onChange("");
        setQuery("");
    };

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => setOpen(v => !v)}
                className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700/60 border rounded-xl text-sm transition-all duration-150 ${
                    open ? "border-orange-400 ring-2 ring-orange-500/25" : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
            >
                <MapPin size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                {open ? (
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        placeholder="Pesquisar sala..."
                        className="flex-1 bg-transparent outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                    />
                ) : (
                    <span className={`flex-1 truncate ${selected ? "text-gray-700 dark:text-slate-200" : "text-gray-400 dark:text-slate-500"}`}>
                        {selected ? selected.name : "Seleciona a sala..."}
                    </span>
                )}
                {selected && !open
                    ? <button type="button" onClick={clear} className="cursor-pointer text-gray-300 hover:text-gray-500 transition-colors"><X size={13} /></button>
                    : <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
                }
            </div>

            {open && (
                <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 dark:text-slate-500 text-center">Nenhuma sala encontrada</div>
                        ) : filtered.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => select(r)}
                                className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors duration-100 ${
                                    String(r.id) === String(value)
                                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold"
                                        : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                }`}
                            >
                                <MapPin size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ReportCard({ report }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = report.description?.length > 120;
    const resolved = report.status === "resolvido";

    return (
        <div className={`px-5 py-4 transition-colors duration-150 ${resolved ? "" : "hover:bg-gray-50 dark:hover:bg-slate-700/20"}`}>
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${resolved ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                    {resolved
                        ? <CheckCircle size={15} className="text-emerald-500" />
                        : <TriangleAlert size={15} className="text-amber-500" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                            <span className={`text-sm font-semibold truncate ${resolved ? "text-gray-400 dark:text-slate-500" : "text-gray-800 dark:text-slate-100"}`}>
                                {report.room_name}
                            </span>
                        </div>
                        <StatusBadge status={report.status} />
                    </div>
                    <p className={`text-sm leading-relaxed ${resolved ? "text-gray-400 dark:text-slate-600" : "text-gray-600 dark:text-slate-400"} ${!expanded && isLong ? "line-clamp-2" : ""}`}>
                        {report.description}
                    </p>
                    {isLong && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="cursor-pointer mt-1 text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-0.5 transition-colors duration-150"
                        >
                            {expanded ? "Ver menos" : "Ver mais"}
                            <ChevronDown size={12} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={11} className="text-gray-300 dark:text-slate-600" />
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                            {formatDate(report.created_at) ?? "Data não disponível"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReportIssue() {
    const { user } = useAuth();
    const location = useLocation();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(
        location.state?.roomId ? String(location.state.roomId) : ""
    );
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [tab, setTab] = useState("new");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => { roomService.getAll().then(setRooms); }, []);

    const loadReports = useCallback(async () => {
        try {
            const data = await reportService.getAll();
            setReports(Array.isArray(data) ? data : []);
        } catch { /* silencioso */ }
        finally { setLoadingReports(false); }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            loadReports();
            const interval = setInterval(loadReports, 10000);
            return () => clearInterval(interval);
        }
    }, [loadReports, user]);

    const pendingCount = reports.filter(r => r.status === "pendente").length;

    const filteredReports = search.trim()
        ? reports.filter(r =>
            r.room_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
        )
        : reports;

    const groupedReports = filteredReports.reduce((acc, r) => {
        const day = r.created_at?.slice(0, 10) || "unknown";
        if (!acc[day]) acc[day] = [];
        acc[day].push(r);
        return acc;
    }, {});

    const formatDayHeader = (dateStr) => {
        if (dateStr === "unknown") return "Data desconhecida";
        const d = new Date(dateStr + "T00:00:00");
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (d.getTime() === today.getTime()) return "Hoje";
        if (d.getTime() === yesterday.getTime()) return "Ontem";
        return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
    };

    const pagedFiltered = filteredReports.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("A imagem não pode ultrapassar 5 MB."); return; }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImage(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRoom) { toast.error("Seleciona uma sala."); return; }
        if (!description.trim()) { toast.error("Descreve o problema."); return; }
        if (description.trim().length < 10) { toast.error("A descrição deve ter pelo menos 10 caracteres."); return; }
        setSubmitting(true);
        try {
            const res = await reportService.create({ user_id: user.id, room_id: selectedRoom, description: description.trim(), image });
            if (res.status === "sucesso") {
                toast.success("Problema reportado! A equipa técnica foi notificada.");
                setSelectedRoom(""); setDescription(""); clearImage();
                loadReports();
                setTab("mine"); setPage(1);
            } else {
                toast.error(translateMessage(res.mensagem || "Erro ao enviar report."));
            }
        } catch { toast.error("Erro ao enviar report."); }
        finally { setSubmitting(false); }
    };

    const canSubmit = !submitting && selectedRoom && description.trim();

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                        <Wrench size={22} className="text-orange-500" />
                        Suporte Técnico
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        Reporta avarias e acompanha o estado dos teus problemas.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-slate-700 gap-1">
                    <button
                        onClick={() => { setTab("new"); setSearch(""); }}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-150 ${
                            tab === "new"
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <AlertTriangle size={14} />
                        Novo Reporte
                    </button>
                    <button
                        onClick={() => { setTab("mine"); setPage(1); setSearch(""); }}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-150 ${
                            tab === "mine"
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <ClipboardList size={14} />
                        Os meus reportes
                        {pendingCount > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${
                                tab === "mine"
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                            }`}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* TAB: NOVO REPORTE */}
            {tab === "new" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulário — ocupa 2/3 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                                {/* Sala */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Sala com problema
                                    </label>
                                    <RoomCombobox rooms={rooms} value={selectedRoom} onChange={setSelectedRoom} />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label htmlFor="desc-textarea" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Descrição do problema
                                    </label>
                                    <textarea
                                        id="desc-textarea"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                        rows={6}
                                        placeholder="Ex: O projetor não liga quando ligado à tomada da esquerda. Acontece desde ontem de manhã..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 resize-none transition-all duration-150 leading-relaxed"
                                    />
                                    <div className="flex items-center justify-between mt-1.5">
                                        <p className="text-xs text-gray-400 dark:text-slate-500">
                                            Quanto mais detalhe, mais rápido conseguimos resolver.
                                        </p>
                                        <span className={`text-xs font-mono transition-colors ${description.length > 800 ? "text-orange-500" : "text-gray-300 dark:text-slate-600"}`}>
                                            {description.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Foto */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Foto do problema{" "}
                                        <span className="font-normal normal-case text-gray-400 dark:text-slate-500">(opcional)</span>
                                    </label>
                                    {imagePreview ? (
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                                            <img src={imagePreview} alt="Pré-visualização da foto do problema" className="w-full max-h-52 object-cover" />
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                aria-label="Remover imagem"
                                                className="cursor-pointer absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors duration-150"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center justify-center gap-2.5 py-7 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl hover:border-orange-300 dark:hover:border-orange-500/50 hover:bg-orange-50/60 dark:hover:bg-orange-900/5 transition-all duration-150">
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                                <ImagePlus size={16} className="text-gray-400 dark:text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Clica para anexar uma foto</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">JPG, PNG ou WebP · máx. 5 MB</p>
                                            </div>
                                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
                                >
                                    {submitting
                                        ? <><Loader2 size={15} className="animate-spin" /> A enviar...</>
                                        : <><Send size={14} /> Enviar Relatório</>
                                    }
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Painel lateral — 1/3 */}
                    <div className="flex flex-col gap-4">
                        {/* Dicas */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Como funciona</p>
                            <ol className="flex flex-col gap-3">
                                {[
                                    { n: "1", text: "Seleciona a sala onde o problema ocorre." },
                                    { n: "2", text: "Descreve o que está errado com o máximo de detalhe." },
                                    { n: "3", text: "Anexa uma foto se ajudar a identificar o problema." },
                                    { n: "4", text: "A equipa técnica recebe a notificação e atualiza o estado." },
                                ].map(s => (
                                    <li key={s.n} className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {s.n}
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{s.text}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                    </div>
                </div>
            )}

            {/* TAB: OS MEUS REPORTES */}
            {tab === "mine" && (
                <div>
                    {/* Barra de pesquisa */}
                    {reports.length > 0 && (
                        <div className="relative mb-4">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Pesquisar por sala ou descrição..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 transition-all duration-150"
                            />
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                        {loadingReports ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 size={24} className="animate-spin text-orange-400" />
                                <p className="text-sm text-gray-400 dark:text-slate-500">A carregar reportes...</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
                                    <ClipboardList size={24} className="text-gray-300 dark:text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Nenhum reporte ainda</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Quando reportares um problema, aparecerá aqui.</p>
                                </div>
                                <button
                                    onClick={() => setTab("new")}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors duration-150"
                                >
                                    <AlertTriangle size={14} /> Reportar um problema
                                </button>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                                <Search size={28} className="text-gray-200 dark:text-slate-700" />
                                <p className="text-sm text-gray-400 dark:text-slate-500">Nenhum reporte encontrado para "<span className="font-semibold">{search}</span>"</p>
                            </div>
                        ) : (
                            <>
                                {Object.entries(groupedReports).map(([day, dayReports]) => {
                                    const paged = dayReports.filter(r =>
                                        pagedFiltered.some(pr => pr.id === r.id)
                                    );
                                    if (paged.length === 0) return null;
                                    return (
                                        <div key={day}>
                                            <div className="px-5 py-2.5 bg-gray-50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700">
                                                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {formatDayHeader(day)}
                                                </span>
                                            </div>
                                            <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
                                                {paged.map(report => (
                                                    <ReportCard key={report.id} report={report} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        <Pagination page={page} totalPages={Math.ceil(filteredReports.length / PER_PAGE)} onChange={setPage} />
                    </div>
                </div>
            )}
        </Layout>
    );
}
