import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, Calendar, MapPin, TrendingUp, CheckCircle, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from "../components/Layout";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const wasUnauthorized = location.state?.unauthorized;
    const [stats, setStats] = useState({
        rooms: 0,
        reservations_today: 0,
        users: 0,
        chart_data: []
    });

    useEffect(() => {
        if (user?.id) {
            dashboardService.getStats(user.id)
                .then((data) => {
                    if (!data.error) setStats(data);
                })
                .catch((err) => console.error("Erro:", err));
        }
    }, [user]);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${color} text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value || 0}</h3>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Olá, {user?.name || 'Visitante'}! 👋</h1>
                <p className="text-gray-500 mt-1">Aqui está o resumo da tua atividade.</p>
                {wasUnauthorized && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
                        <ShieldAlert size={20} />
                        <span>Não tens permissão para aceder a essa página.</span>
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 gap-6 mb-8 ${(user?.role === 'admin' || user?.role === 'funcionario') ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                <StatCard icon={CheckCircle} label="Salas Disponíveis" value={stats.rooms} color="bg-blue-500" />
                <StatCard icon={Calendar} label="Minhas Reservas Hoje" value={stats.reservations_today} color="bg-green-500" />
                {(user?.role === 'admin' || user?.role === 'funcionario') && (
                    <StatCard icon={Users} label="Utilizadores Ativos" value={stats.users} color="bg-purple-500" />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Top 5 Salas Mais Populares
                    </h2>
                    <div className="h-64 w-full">
                        {stats.chart_data && stats.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chart_data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="reservas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Sem dados para mostrar.</div>
                        )}
                    </div>
                </div>

                <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Dica Pro 🚀</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">
                            Usa a pesquisa na aba "Gerir Reservas" para encontrar rapidamente quem reservou o quê.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
                </div>
            </div>
        </Layout>
    );
}