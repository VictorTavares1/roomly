import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import Layout from "../components/Layout";
import { reportService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MyReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await reportService.getAll();
                // Filtra apenas os reports do utilizador atual
                const myReports = Array.isArray(data)
                    ? data.filter((r) => r.user_id === user?.id || r.user_name === user?.name)
                    : [];
                setReports(myReports);
            } catch (err) {
                console.error("Erro ao carregar reports:", err);
            } finally {
                setLoading(false);
            }
        }
        if (user?.id) load();
    }, [user]);

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200 mb-6">Meus Reports 📋</h1>
            <p className="text-gray-500 dark:text-slate-400 mb-8">Acompanha o estado dos problemas que reportaste.</p>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-40" />
                    <p className="font-medium">Ainda não reportaste nenhum problema.</p>
                    <p className="text-sm mt-1">Quando reportares uma avaria, ela aparecerá aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${report.status === "resolvido"
                                    ? "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 opacity-90"
                                    : "bg-white dark:bg-slate-800 border-red-100 dark:border-slate-700 shadow-sm border-l-4 border-l-red-500"
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-800 dark:text-slate-200 text-lg flex items-center gap-2">
                                        <MapPin size={18} className="text-gray-400" /> {report.room_name}
                                    </span>
                                    {report.status === "aberto" ? (
                                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <AlertTriangle size={12} /> Em análise
                                        </span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle size={12} /> Resolvido
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-slate-400 mb-3">&quot;{report.description}&quot;</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> Reportado em {new Date(report.created_at).toLocaleDateString("pt-PT")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
