import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Calendar,
    MapPin,
    Users,
    Settings,
    BookOpen,
    AlertTriangle,
    Wrench,
    ClipboardList,
    Moon,
    Sun
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        return parts.length === 1
            ? parts[0].charAt(0).toUpperCase()
            : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-medium
                    ${active
                        ? "bg-blue-600/15 text-blue-400"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
            >
                <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? "text-blue-400" : "text-slate-500"}
                />
                {label}
            </Link>
        );
    };

    return (
        <aside className="w-64 h-full flex flex-col bg-slate-900 border-r border-slate-800 transition-colors duration-300">

            {/* === LOGO === */}
            <div className="flex items-center gap-3 px-5 pt-6 pb-5">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Logo className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-base font-bold text-white tracking-tight leading-none">Roomly</h1>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Gestão de Salas</p>
                </div>
            </div>

            {/* === PERFIL === */}
            <div className="px-4 mb-4">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-white">{getInitials(user?.name)}</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-200 truncate">{user?.name || "Utilizador"}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{user?.role || "professor"}</p>
                    </div>
                </div>
            </div>

            {/* === MENU PRINCIPAL === */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-0.5">

                <p className="text-[10px] uppercase text-slate-600 font-semibold px-3 mb-1.5 tracking-wider">
                    Principal
                </p>

                <NavItem to="/dashboard" icon={LayoutDashboard} label="Início" />
                <NavItem to="/rooms" icon={MapPin} label="Ver Salas" />
                <NavItem to="/my-reservations" icon={Calendar} label="Minhas Reservas" />
                <NavItem to="/new-reservation" icon={PlusCircle} label="Nova Reserva" />

                <div className="my-3 mx-2 border-t border-slate-800" />

                <p className="text-[10px] uppercase text-slate-600 font-semibold px-3 mb-1.5 tracking-wider">
                    Suporte
                </p>

                <NavItem to="/report-issue" icon={AlertTriangle} label="Reportar Problema" />
                <NavItem to="/my-reports" icon={ClipboardList} label="Meus Reports" />

                {/* === ADMINISTRAÇÃO === */}
                {(user?.role === 'admin' || user?.role === 'funcionario') && (
                    <>
                        <div className="my-3 mx-2 border-t border-slate-800" />
                        <p className="text-[10px] uppercase text-slate-600 font-semibold px-3 mb-1.5 tracking-wider">
                            Administração
                        </p>

                        <NavItem to="/manage-reports" icon={Wrench} label="Manutenção" />

                        {user?.role === 'admin' && (
                            <>
                                <NavItem to="/create-room" icon={PlusCircle} label="Criar Sala" />
                                <NavItem to="/manage-users" icon={Users} label="Utilizadores" />
                                <NavItem to="/manage-reservations" icon={BookOpen} label="Gerir Reservas" />
                            </>
                        )}
                    </>
                )}
            </nav>

            {/* === RODAPÉ === */}
            <div className="mt-auto border-t border-slate-800 p-3 space-y-0.5">

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all duration-200 text-[13px] font-medium"
                >
                    {theme === "dark" ? (
                        <><Sun size={18} strokeWidth={1.8} className="text-amber-500" /> Modo Claro</>
                    ) : (
                        <><Moon size={18} strokeWidth={1.8} className="text-slate-500" /> Modo Escuro</>
                    )}
                </button>

                <NavItem to="/settings" icon={Settings} label="Definições" />

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200 text-[13px] font-medium"
                >
                    <LogOut size={18} strokeWidth={1.8} />
                    Terminar Sessão
                </button>
            </div>
        </aside>
    );
}