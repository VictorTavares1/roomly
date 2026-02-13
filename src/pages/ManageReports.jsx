import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, MapPin, User, Wrench } from "lucide-react";
import Layout from "../components/Layout";
import { reportService } from "../services/api";

export default function ManageReports() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        reportService.getAll().then(setReports);
    };

    const handleResolve = async (id) => {
        if (!window.confirm("Confirmas que o problema está resolvido?")) return;

        const res = await reportService.updateStatus(id, 'resolvido');
        if (res.status === "sucesso") {
            setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolvido' } : r)));
        }
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Wrench className="text-gray-600" /> Manutenção & Reports
            </h1>

            <div className="grid grid-cols-1 gap-4">
                {reports.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        Nenhum problema reportado. Tudo a funcionar! 🎉
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${report.status === 'resolvido' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-red-100 shadow-sm border-l-4 border-l-red-500'}`}>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <MapPin size={18} className="text-gray-400" /> {report.room_name}
                                    </span>
                                    {report.status === 'aberto' ? (
                                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><AlertTriangle size={12} /> Aberto</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Resolvido</span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-3">"{report.description}"</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><User size={12} /> Reportado por: {report.user_name}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {report.status === 'aberto' && (
                                <button
                                    onClick={() => handleResolve(report.id)}
                                    className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                                >
                                    <CheckCircle size={16} /> Marcar Resolvido
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
}