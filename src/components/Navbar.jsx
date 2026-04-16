import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Search, Bell, ChevronDown, Sun, Moon, Settings,
    LogOut, MapPin, Calendar, PlusCircle, AlertTriangle,
    ClipboardList, Wrench, Users, BookOpen, LayoutDashboard,
    Menu, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1
        ? parts[0].charAt(0).toUpperCase()
        : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const roleLabel = { admin: "Gestor Escolar", funcionario: "Funcionário", professor: "Professor" };

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const [openMenu, setOpenMenu] = useState(null); // 'principal' | 'suporte' | 'admin' | 'user'
    const [mobileOpen, setMobileOpen] = useState(false);
    const navRef = useRef(null);

    const isAdmin = user?.role === "admin";
    const isStaff = user?.role === "admin" || user?.role === "funcionario";

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handler = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fecha menus ao mudar de rota
    useEffect(() => {
        setOpenMenu(null);
        setMobileOpen(false);
    }, [location.pathname]);

    const toggle = (menu) => setOpenMenu((prev) => (prev === menu ? null : menu));

    /* ── sub-componentes ── */

    const DropdownItem = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
                    ${active
                        ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60"
                    }`}
            >
                <Icon size={14} className={active ? "text-blue-500" : "text-gray-400 dark:text-slate-500"} />
                {label}
            </Link>
        );
    };

    const NavMenu = ({ label, menuKey, children }) => {
        const isOpen = openMenu === menuKey;
        return (
            <div className="relative">
                <button
                    onClick={() => toggle(menuKey)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors select-none
                        ${isOpen
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/60"
                        }`}
                >
                    {label}
                    <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-down py-1">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    /* ── JSX ── */
    return (
        <>
            <header
                ref={navRef}
                className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-white/[0.08] shadow-sm dark:shadow-black/30 transition-colors duration-300"
            >
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-2">

                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 mr-3 shrink-0">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Logo className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight">
                            Roomly
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        <NavMenu label="Principal" menuKey="principal">
                            <DropdownItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <div className="mx-3 my-1 border-t border-gray-100 dark:border-slate-700" />
                            <DropdownItem to="/rooms" icon={MapPin} label="Ver Salas" />
                            <DropdownItem to="/my-reservations" icon={Calendar} label="Minhas Reservas" />
                        </NavMenu>

                        <NavMenu label="Suporte" menuKey="suporte">
                            <DropdownItem to="/report-issue" icon={AlertTriangle} label="Reportar Problema" />
                            <DropdownItem to="/my-reports" icon={ClipboardList} label="Meus Reports" />
                        </NavMenu>

                        {isStaff && (
                            <NavMenu label="Administração" menuKey="admin">
                                <DropdownItem to="/manage-reports" icon={Wrench} label="Gestão de Manutenção" />
                                {isAdmin && (
                                    <>
                                        <div className="mx-3 my-1 border-t border-gray-100 dark:border-slate-700" />
                                        <DropdownItem to="/manage-users" icon={Users} label="Utilizadores" />
                                        <DropdownItem to="/manage-reservations" icon={BookOpen} label="Gerir Reservas" />
                                    </>
                                )}
                            </NavMenu>
                        )}
                    </nav>

                    <div className="flex-1" />

                    {/* Search bar */}
                    <div className="hidden lg:flex items-center gap-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600/60 rounded-xl px-3 py-2 w-60 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
                        <Search size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Procurar sala ou reserva..."
                            className="bg-transparent text-sm text-gray-600 dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500 outline-none w-full"
                        />
                    </div>

                    {/* Notification bell */}
                    <button className="p-2 ml-1 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors">
                        <Bell size={18} />
                    </button>

                    {/* User avatar dropdown */}
                    <div className="relative ml-1">
                        <button
                            onClick={() => toggle("user")}
                            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors
                                ${openMenu === "user"
                                    ? "bg-gray-100 dark:bg-slate-700"
                                    : "hover:bg-gray-100 dark:hover:bg-slate-700/60"
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-tight">
                                    {user?.name?.split(" ")[0] || "User"}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                    {roleLabel[user?.role] || user?.role}
                                </p>
                            </div>
                            <ChevronDown
                                size={13}
                                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${openMenu === "user" ? "rotate-180" : ""}`}
                            />
                        </button>

                        {openMenu === "user" && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-down">
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{user?.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{user?.email}</p>
                                </div>

                                <div className="py-1">
                                    {/* Theme toggle */}
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
                                    >
                                        {theme === "dark"
                                            ? <><Sun size={14} className="text-amber-400" /> Modo Claro</>
                                            : <><Moon size={14} className="text-slate-400" /> Modo Escuro</>
                                        }
                                    </button>

                                    {/* Settings */}
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
                                    >
                                        <Settings size={14} className="text-gray-400 dark:text-slate-500" />
                                        Definições
                                    </Link>

                                    <div className="mx-3 my-1 border-t border-gray-100 dark:border-slate-700" />

                                    {/* Logout */}
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Terminar Sessão
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden p-2 ml-1 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile nav drawer */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 animate-fade-in-down">
                        <div className="px-4 py-3 space-y-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider px-2 py-1">Principal</p>
                            <MobileItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" loc={location} />
                            <MobileItem to="/rooms" icon={MapPin} label="Ver Salas" loc={location} />
                            <MobileItem to="/my-reservations" icon={Calendar} label="Minhas Reservas" loc={location} />

                            <div className="my-2 border-t border-gray-100 dark:border-slate-700" />
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider px-2 py-1">Suporte</p>
                            <MobileItem to="/report-issue" icon={AlertTriangle} label="Reportar Problema" loc={location} />
                            <MobileItem to="/my-reports" icon={ClipboardList} label="Meus Relatórios" loc={location} />

                            {isStaff && (
                                <>
                                    <div className="my-2 border-t border-gray-100 dark:border-slate-700" />
                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider px-2 py-1">Administração</p>
                                    <MobileItem to="/manage-reports" icon={Wrench} label="Gestão de Manutenção" loc={location} />
                                    {isAdmin && (
                                        <>
                                            <MobileItem to="/manage-users" icon={Users} label="Utilizadores" loc={location} />
                                            <MobileItem to="/manage-reservations" icon={BookOpen} label="Gerir Reservas" loc={location} />
                                        </>
                                    )}
                                </>
                            )}

                            <div className="my-2 border-t border-gray-100 dark:border-slate-700" />
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                {theme === "dark"
                                    ? <><Sun size={16} className="text-amber-400" /> Modo Claro</>
                                    : <><Moon size={16} className="text-slate-400" /> Modo Escuro</>
                                }
                            </button>
                            <MobileItem to="/settings" icon={Settings} label="Definições" loc={location} />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                                <LogOut size={16} /> Terminar Sessão
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}

function MobileItem({ to, icon: Icon, label, loc }) {
    const active = loc.pathname === to;
    return (
        <Link
            to={to}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium
                ${active
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60"
                }`}
        >
            <Icon size={16} className={active ? "text-blue-500" : "text-gray-400 dark:text-slate-500"} />
            {label}
        </Link>
    );
}
