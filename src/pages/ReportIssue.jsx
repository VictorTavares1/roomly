import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    AlertTriangle, Send, MapPin, CheckCircle, Clock,
    ClipboardList, Wrench, TriangleAlert, ImagePlus, X
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { roomService, reportService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

const STATUS = {
    aberto:     { label: "Em análise",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
    em_curso:   { label: "Em curso",    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",   dot: "bg-blue-500" },
    resolvido:  { label: "Resolvido",   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
};

const formatDate = (str) => {
    if (!str) return null;
    const d = new Date(str.includes("T") ? str : str.replace(" ", "T"));
    if (isNaN(d)) return null;
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
};

function StatusBadge({ status }) {
    const s = STATUS[status] || STATUS.aberto;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
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

    useEffect(() => { roomService.getAll().then(setRooms); }, []);

    const loadReports = useCallback(async () => {
        try {
            const data = await reportService.getAll();
            const mine = Array.isArray(data)
                ? data.filter(r => r.user_id === user?.id || r.user_name === user?.name)
                : [];
            setReports(mine);
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

    const [tab, setTab] = useState("new");

    const openCount = reports.filter(r => r.status !== "resolvido").length;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem não pode ultrapassar 5 MB.");
            return;
        }
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

        setSubmitting(true);
        try {
            const res = await reportService.create({
                user_id: user.id,
                room_id: selectedRoom,
                description: description.trim(),
                image,
            });

            if (res.status === "sucesso") {
                toast.success("Problema reportado! A equipa técnica foi notificada.");
                setSelectedRoom("");
                setDescription("");
                clearImage();
                loadReports();
            } else {
                toast.error(translateMessage(res.mensagem || "Erro ao enviar report."));
            }
        } catch (err) {
            toast.error("Erro ao enviar report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                            <Wrench size={22} className="text-orange-500" />
                            Suporte Técnico
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                            Reporta avarias e acompanha o estado dos teus problemas.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-slate-700 gap-1">
                    <button
                        onClick={() => setTab("new")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                            tab === "new"
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <AlertTriangle size={15} />
                        Novo Reporte
                    </button>
                    <button
                        onClick={() => setTab("mine")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                            tab === "mine"
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <ClipboardList size={15} />
                        Os meus reportes
                        {openCount > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                tab === "mine"
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                            }`}>
                                {openCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── TAB: NOVO REPORTE ── */}
            {tab === "new" && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden max-w-2xl">
                    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            {/* Sala */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Sala com problema
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-slate-500 pointer-events-none" size={15} />
                                    <select
                                        value={selectedRoom}
                                        onChange={e => setSelectedRoom(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm text-slate-700 dark:text-slate-200 transition-all"
                                    >
                                        <option value="">Seleciona a sala...</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Descrição do problema
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    rows={5}
                                    placeholder="Ex: O projetor não liga quando ligado à tomada da esquerda. Acontece desde ontem de manhã..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm text-slate-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 resize-none transition-all leading-relaxed"
                                />
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                                    Quanto mais detalhe deres, mais rápido conseguimos resolver.
                                </p>
                            </div>

                            {/* Imagem opcional */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Foto do problema <span className="font-normal normal-case text-gray-400">(opcional)</span>
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                                        <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover" />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all">
                                        <ImagePlus size={22} className="text-gray-400 dark:text-slate-500" />
                                        <span className="text-xs text-gray-400 dark:text-slate-500 text-center">
                                            Clica para anexar uma foto<br />
                                            <span className="text-[11px]">JPG, PNG ou WebP · máx. 5 MB</span>
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !selectedRoom || !description.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
                            >
                                {submitting ? (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={15} />
                                )}
                                {submitting ? "A enviar..." : "Enviar Relatório"}
                            </button>
                        </form>
                </div>
            )}

            {/* ── TAB: OS MEUS REPORTES ── */}
            {tab === "mine" && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="divide-y divide-gray-50 dark:divide-slate-700/60">
                        {loadingReports ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
                                    <ClipboardList size={28} className="text-gray-300 dark:text-slate-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">Nenhum reporte ainda</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Os teus relatórios aparecerão aqui.</p>
                                </div>
                                <button
                                    onClick={() => setTab("new")}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    <AlertTriangle size={15} /> Reportar um problema
                                </button>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id}
                                    className={`px-5 py-4 flex flex-col gap-2 transition-colors ${
                                        report.status === "resolvido"
                                            ? "opacity-60"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                                    }`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <MapPin size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">
                                                {report.room_name}
                                            </span>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2 pl-5">
                                        {report.description}
                                    </p>
                                    <div className="flex items-center gap-2 pl-5">
                                        <Clock size={11} className="text-gray-400 dark:text-slate-500" />
                                        <span className="text-xs text-gray-400 dark:text-slate-500">
                                            {formatDate(report.created_at) ?? "Data não disponível"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
