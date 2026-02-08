import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Calendar,
    MapPin,
    Users,
    Settings, // <--- Ícone Novo
    BookOpen
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Função auxiliar para saber qual link está ativo
    const isActive = (path) => location.pathname === path
        ? "bg-white/10 text-white shadow-lg"
        : "text-blue-100 hover:bg-white/5 hover:text-white";

    return (
        <aside className="w-64 bg-blue-900 text-white min-h-screen p-6 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300">

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-white/10 p-2 rounded-lg">
                    <span className="text-2xl">🚀</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Roomly</h1>
                    <p className="text-xs text-blue-300">Gestão de Salas</p>
                </div>
            </div>

            {/* MENU PRINCIPAL */}
            <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="text-xs uppercase text-blue-400 font-bold px-4 mb-2 mt-2 tracking-wider">Principal</p>

                <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/dashboard')}`}>
                    <LayoutDashboard size={20} /> Início
                </Link>
                <Link to="/rooms" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/rooms')}`}>
                    <MapPin size={20} /> Ver Salas
                </Link>
                <Link to="/my-reservations" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/my-reservations')}`}>
                    <Calendar size={20} /> Minhas Reservas
                </Link>
                <Link to="/new-reservation" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/new-reservation')}`}>
                    <PlusCircle size={20} /> Nova Reserva
                </Link>

                {/* MENU ADMINISTRAÇÃO (Só aparece para admin) */}
                {user?.role === 'admin' && (
                    <>
                        <div className="my-4 border-t border-blue-800/50"></div>
                        <p className="text-xs uppercase text-blue-400 font-bold px-4 mb-2 tracking-wider">Administração</p>

                        <Link to="/create-room" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/create-room')}`}>
                            <PlusCircle size={20} /> Criar Sala
                        </Link>
                        <Link to="/manage-users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/manage-users')}`}>
                            <Users size={20} /> Utilizadores
                        </Link>
                        <Link to="/manage-reservations" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/manage-reservations')}`}>
                            <BookOpen size={20} /> Gerir Reservas
                        </Link>
                    </>
                )}
            </nav>

            {/* RODAPÉ (Configurações e Logout) */}
            <div className="mt-auto border-t border-blue-800 pt-4 space-y-2">
                <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/settings')}`}>
                    <Settings size={20} /> Definições
                </Link>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all font-medium group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Terminar Sessão
                </button>
            </div>
        </aside>
    );
}