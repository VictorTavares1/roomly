import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Calendar, ShieldAlert, Clock, Activity,
    History, Users, DoorOpen, CheckCircle2, XCircle,
    AlertTriangle, UserPlus, Edit3, ChevronRight, BarChart2,
    PlusSquare, Trash2, UserCog, ShieldCheck, FileEdit, QrCode
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from "recharts";
import Layout from "../components/Layout";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── helpers ─── */
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


/* ─── activity icon mapping ─── */
const activityIcon = (type) => {
    switch (type) {
        case "reserva_pendente":
            return { Icon: QrCode, bg: "bg-amber-100 dark:bg-amber-900/40", color: "text-amber-500 dark:text-amber-400" };
        case "reserva":
            return { Icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-900/40", color: "text-emerald-600 dark:text-emerald-400" };
        case "cancelamento":
            return { Icon: XCircle, bg: "bg-red-100 dark:bg-red-900/40", color: "text-red-500 dark:text-red-400" };
        case "alteracao":
            return { Icon: Edit3, bg: "bg-blue-100 dark:bg-blue-900/40", color: "text-blue-500 dark:text-blue-400" };
        case "reporte":
            return { Icon: AlertTriangle, bg: "bg-orange-100 dark:bg-orange-900/40", color: "text-orange-500 dark:text-orange-400" };
        case "alteracao_reporte":
            return { Icon: FileEdit, bg: "bg-orange-100 dark:bg-orange-900/40", color: "text-orange-500 dark:text-orange-400" };
        case "admin_delete":
            return { Icon: XCircle, bg: "bg-red-100 dark:bg-red-900/40", color: "text-red-500" };
        case "novo_convidado":
            return { Icon: UserPlus, bg: "bg-blue-100 dark:bg-blue-900/40", color: "text-blue-500 dark:text-blue-400" };
        case "nova_sala":
            return { Icon: PlusSquare, bg: "bg-emerald-100 dark:bg-emerald-900/40", color: "text-emerald-600 dark:text-emerald-400" };
        case "alteracao_sala":
            return { Icon: Edit3, bg: "bg-violet-100 dark:bg-violet-900/40", color: "text-violet-500 dark:text-violet-400" };
        case "remocao_sala":
            return { Icon: Trash2, bg: "bg-red-100 dark:bg-red-900/40", color: "text-red-500 dark:text-red-400" };
        case "novo_utilizador":
            return { Icon: UserPlus, bg: "bg-blue-100 dark:bg-blue-900/40", color: "text-blue-500 dark:text-blue-400" };
        case "alteracao_status":
            return { Icon: ShieldCheck, bg: "bg-amber-100 dark:bg-amber-900/40", color: "text-amber-500 dark:text-amber-400" };
        case "alteracao_cargo":
            return { Icon: UserCog, bg: "bg-violet-100 dark:bg-violet-900/40", color: "text-violet-500 dark:text-violet-400" };
        default:
            return { Icon: Activity, bg: "bg-indigo-100 dark:bg-indigo-900/40", color: "text-indigo-500 dark:text-indigo-400" };
    }
};

/* ─── subcomponents ─── */
const StatCard = ({ icon: Icon, label, value, iconBg, sub, subColor = "text-gray-400 dark:text-slate-500" }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
            <div className={`p-2 rounded-xl ${iconBg}`}>
                <Icon size={18} className="text-white" />
            </div>
        </div>
        <p className="text-3xl font-black text-gray-800 dark:text-slate-100 mb-1">{value ?? 0}</p>
        {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
);

const BAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-bold text-gray-800 dark:text-slate-100 mb-0.5">{d.name}</p>
            {d.capacity && <p className="text-gray-400 dark:text-slate-500">Cap.: {d.capacity} pessoas</p>}
            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{d.reservas} reservas</p>
        </div>
    );
};

const ActivityItem = ({ act, isLast }) => {
    const { Icon, bg, color } = activityIcon(act.type);
    return (
        <div className="flex items-start gap-3 pt-3 pb-0">
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon size={15} className={color} />
                </div>
                {!isLast && <div className="w-px flex-1 min-h-[24px] bg-gray-200 dark:bg-slate-700 mt-1" />}
            </div>
            <div className="min-w-0 flex-1 pb-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-snug">
                    {act.action_label || act.action}
                </p>
                {act.user && (
                    <p className="text-xs font-medium text-blue-500 dark:text-blue-400 mt-0.5">{act.user}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                    {act.target}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-600 mt-0.5">{act.time}</p>
            </div>
        </div>
    );
};


/* ─── main component ─── */
export default function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const wasUnauthorized = location.state?.unauthorized;

    const [stats, setStats] = useState({
        rooms: 0, reservations_today: 0,
        total_reservations: 0, users: 0,
        reported_problems: 0,
        chart_data: [], recent_activities: [],
    });
    const fetchStats = useCallback(() => {
        if (!user?.id) return;
        dashboardService.getStats()
            .then((data) => {
                if (!data.error) {
                    const processedActivities = (data.recent_activities || []).map(act => ({
                        ...act, time: timeAgo(act.time),
                    }));
                    setStats({ ...data, recent_activities: processedActivities });
                }
            })
            .catch(() => { });
    }, [user]);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    return (
        <Layout>
            {/* Header */}
            <div className="mb-7 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                            O seu resumo
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                            {new Date().toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                </div>

                {wasUnauthorized && (
                    <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 animate-fade-in-down">
                        <ShieldAlert size={17} className="shrink-0" />
                        <span className="text-sm font-medium">Não tens permissão para aceder a essa página.</span>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className={`grid grid-cols-2 gap-4 mb-7 stagger-children ${user?.role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                <StatCard
                    icon={DoorOpen}
                    label="Salas Disponíveis"
                    value={stats.rooms}
                    sub="para reservar"
                    iconBg="bg-blue-500"
                />
                <StatCard
                    icon={Calendar}
                    label="Reservas Hoje"
                    value={stats.reservations_today}
                    iconBg="bg-emerald-500"
                    sub={user?.role === 'admin' || user?.role === 'funcionario' ? "confirmadas hoje" : "confirmadas hoje"}
                    subColor="text-emerald-500 dark:text-emerald-400"
                />
                <StatCard
                    icon={ShieldAlert}
                    label="Problemas Reportados"
                    value={stats.reported_problems}
                    iconBg="bg-orange-500"
                    sub={user?.role === 'admin' || user?.role === 'funcionario' ? "pendentes de resolução" : "os meus reportes pendentes"}
                    subColor="text-orange-500 dark:text-orange-400"
                />
                {user?.role === 'admin' && (
                    <StatCard
                        icon={Users}
                        label="Utilizadores"
                        value={stats.users}
                        iconBg="bg-rose-500"
                        sub="contas registadas"
                    />
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

                {/* Salas Populares */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 animate-fade-in-up">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                <BarChart2 size={17} className="text-blue-500" />
                                Salas Mais Reservadas
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                Uso total no histórico do sistema
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/rooms")}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            Ver todas <ChevronRight size={13} />
                        </button>
                    </div>

                    <div className="mt-4">
                        {stats.chart_data && stats.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={stats.chart_data}
                                    margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                                    barCategoryGap="30%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #f1f5f9)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                        tickFormatter={v => v.length > 10 ? v.slice(0, 10) + "…" : v}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                                    <Bar dataKey="reservas" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                        {stats.chart_data.map((_, i) => (
                                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 dark:text-slate-500">
                                <DoorOpen size={32} className="opacity-20" />
                                <p className="text-sm">Ainda não há dados de salas.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Atividade Recente */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <Clock size={17} className="text-blue-500" />
                            Atividade Recente
                        </h2>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 mb-3">Últimas ações no sistema</p>

                    <div className="overflow-hidden">
                        {stats.recent_activities && stats.recent_activities.length > 0 ? (
                            stats.recent_activities.slice(0, 5).map((act, i, arr) => (
                                <ActivityItem key={i} act={act} isLast={i === arr.length - 1} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400 dark:text-slate-500">
                                <Activity size={28} className="opacity-20" />
                                <p className="text-sm">Sem atividade recente.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </Layout>
    );
}
