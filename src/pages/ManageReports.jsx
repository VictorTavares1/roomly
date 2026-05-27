import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle, CheckCircle2, Clock, MapPin, User, Wrench, ClipboardList, ImageIcon, X } from "lucide-react";

const API_BASE = "http://127.0.0.1/Roomly/roomly_api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { reportService } from "../services/api";

const STATUS = {
    aberto:    { label: "Em análise", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500" },
    em_curso:  { label: "Em curso",   color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",   dot: "bg-blue-500" },
    resolvido: { label: "Resolvido",  color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
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

export default function ManageReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxUrl, setLightboxUrl] = useState(null);

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

    const handleResolve = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Confirmas que o problema está resolvido?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        const res = await reportService.updateStatus(id, "resolvido");
                        if (res.status === "sucesso") {
                            setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "resolvido" } : r));
                            toast.success("Problema marcado como resolvido!");
                        }
                    }} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                        Sim, resolvido
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const openCount     = reports.filter(r => r.status !== "resolvido").length;
    const resolvedCount = reports.filter(r => r.status === "resolvido").length;

    return (
        <Layout>
            {/* Header */}
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                    <Wrench size={22} className="text-orange-500" />
                    Gerir Reports
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    Acompanha e resolve os problemas reportados pelos utilizadores.
                </p>
            </div>

            {/* Lista */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
                        <CheckCircle2 size={36} className="opacity-20 text-emerald-500" />
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Nenhum problema reportado.</p>
                        <p className="text-xs">Tudo a funcionar normalmente!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-slate-700/60">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                                    report.status === "resolvido"
                                        ? "opacity-60"
                                        : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                                }`}
                            >
                                <div className="flex-1 flex flex-col gap-2 min-w-0">
                                    {/* Room + status */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">
                                                {report.room_name}
                                            </span>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2 pl-5">
                                        {report.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 pl-5">
                                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <User size={11} />
                                            {report.user_name}
                                        </span>
                                        <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Clock size={11} />
                                            {new Date(report.created_at).toLocaleDateString("pt-PT", {
                                                day: "2-digit", month: "short", year: "numeric"
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
                                        <span className="text-xs text-gray-400 dark:text-slate-500">
                                            Report #{report.id}
                                        </span>
                                    </div>
                                </div>

                                {/* Right side: image thumbnail + action */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {report.image_path ? (
                                        <button
                                            type="button"
                                            onClick={() => setLightboxUrl(`${API_BASE}/${report.image_path}`)}
                                            className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shrink-0"
                                            title="Ver imagem"
                                        >
                                            <img
                                                src={`${API_BASE}/${report.image_path}`}
                                                alt="Foto do problema"
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                            <ImageIcon size={16} className="text-gray-300 dark:text-slate-600" />
                                        </div>
                                    )}

                                    {report.status !== "resolvido" && (
                                        <button
                                            onClick={() => handleResolve(report.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
                                        >
                                            <CheckCircle size={13} /> Marcar Resolvido
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        onClick={() => setLightboxUrl(null)}
                    >
                        <X size={18} />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Foto do problema"
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </Layout>
    );
}
