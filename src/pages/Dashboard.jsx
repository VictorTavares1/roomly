import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, Calendar, TrendingUp, CheckCircle, ShieldAlert, Clock, Activity, History } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from "../components/Layout";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";

function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min atrás";
    return "Agora mesmo";
}

const RecentActivity = ({ activities }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-full flex flex-col transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} /> Atividade Recente
        </h2>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activities && activities.length > 0 ? (
                activities.map((act, index) => (
                    <div key={index} className="flex gap-4 items-start pb-4 border-b border-gray-50 dark:border-slate-700 last:border-0 last:pb-0">
                        <div className={`mt-1 p-2 rounded-full shrink-0 ${act.type === 'reserva' ? 'bg-green-100 dark:bg-green-900/40 text-green-600' :
                            act.type === 'cancelamento' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                            }`}>
                            <Activity size={14} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 dark:text-slate-300 font-medium leading-snug">
                                <span className="font-bold text-blue-600">{act.user}</span> {act.action} <span className="font-bold">{act.target}</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{act.time}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                    Sem atividade recente.
                </div>
            )}
        </div>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const wasUnauthorized = location.state?.unauthorized;

    const [stats, setStats] = useState({
        rooms: 0,
        reservations_today: 0,
        total_reservations: 0,
        users: 0,
        chart_data: [],
        recent_activities: []
    });

    useEffect(() => {
        if (user?.id) {
            dashboardService.getStats()
                .then((data) => {
                    if (!data.error) {
                        const processedActivities = (data.recent_activities || []).map(act => ({
                            ...act,
                            time: timeAgo(act.time)
                        }));

                        setStats({
                            ...data,
                            recent_activities: processedActivities
                        });
                    }
                })
                .catch((err) => console.error("Erro:", err));
        }
    }, [user]);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-4 rounded-full ${color} text-white shadow-lg shadow-opacity-20`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">{value || 0}</h3>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200">Olá, {user?.name || 'Visitante'}! 👋</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Aqui está o resumo da atividade.</p>
                    </div>
                    <div className="text-sm text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-slate-700">
                        {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {wasUnauthorized && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 animate-fadeIn">
                        <ShieldAlert size={20} />
                        <span>Não tens permissão para aceder a essa página.</span>
                    </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={CheckCircle} label="Salas Disponíveis Agora" value={stats.rooms} color="bg-blue-600" />
                <StatCard icon={Calendar} label="Minhas Reservas Hoje" value={stats.reservations_today} color="bg-emerald-500" />
                <StatCard icon={History} label="Total Histórico de Reservas" value={stats.total_reservations} color="bg-violet-600" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col min-h-[400px] transition-colors">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" size={20} /> Top Salas Mais Populares
                    </h2>
                    <div className="flex-1 w-full min-h-[300px]">
                        {stats.chart_data && stats.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chart_data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="reservas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} activeBar={{ fill: '#2563eb' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
                                <BarChart size={48} className="opacity-20" />
                                <p>Ainda não há dados suficientes.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Atividade Recente */}
                <div className="lg:col-span-1 min-h-[400px]">
                    <RecentActivity activities={stats.recent_activities} />
                </div>
            </div>
        </Layout>
    );
}