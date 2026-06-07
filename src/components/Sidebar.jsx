import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, MapPin, Calendar, AlertTriangle,
    Wrench, Users, BookOpen, Settings,
    LogOut, Sun, Moon, Search, X, Menu, ChevronRight,
    Building2, CalendarCheck, Download
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";
import { roomService, reservationService } from "../services/api";
import { getAvatarColors, getInitials } from "../utils/avatar";

function Avatar({ name, size = "md" }) {
    const [from, to] = getAvatarColors(name || "");
    const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]"
        : size === "md" ? "w-8 h-8 text-xs"
        : "w-10 h-10 text-sm";
    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-sm`}
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
            {getInitials(name || "")}
        </div>
    );
}

function GlobalSearch({ onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setOpen(false); return; }
        setLoading(true);
        try {
            const [rooms, reservations] = await Promise.all([
                roomService.getAll(),
                reservationService.getMyReservations(),
            ]);
            const ql = q.toLowerCase();
            const roomHits = (rooms || [])
                .filter(r => r.name.toLowerCase().includes(ql) || (r.type || "").toLowerCase().includes(ql))
                .slice(0, 4)
                .map(r => ({ type: "room", id: r.id, title: r.name, sub: r.type || "Sala", status: r.status, room: r }));
            const resHits = (reservations || [])
                .filter(r => (r.room_name || "").toLowerCase().includes(ql) || (r.purpose || "").toLowerCase().includes(ql))
                .slice(0, 4)
                .map(r => ({ type: "reservation", id: r.id, title: r.room_name, sub: r.purpose || "Sem motivo", status: r.status }));
            setResults([...roomHits, ...resHits]);
            setOpen(true);
        } catch { setResults([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => search(query), 280);
        return () => clearTimeout(t);
    }, [query, search]);

    const handleSelect = (item) => {
        setQuery(""); setOpen(false);
        if (onClose) onClose();
        if (item.type === "room") navigate("/rooms", { state: { highlight: item.id } });
        else navigate("/my-reservations");
    };

    const statusBadge = {
        disponivel: "bg-emerald-100 text-emerald-700",
        ocupada: "bg-orange-100 text-orange-700",
        em_manutencao: "bg-red-100 text-red-700",
        confirmada: "bg-blue-100 text-blue-700",
        cancelada: "bg-gray-100 text-gray-500",
    };
    const statusLabel = {
        disponivel: "Disponível", ocupada: "Ocupada",
        em_manutencao: "Manutenção", confirmada: "Confirmada", cancelada: "Cancelada",
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className={`flex items-center gap-2 bg-gray-100 dark:bg-slate-700/60 border rounded-xl px-3 py-2 transition-all
                ${open ? "border-blue-400 ring-2 ring-blue-500/20" : "border-transparent"}
                focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20`}>
                <Search size={13} className={`shrink-0 transition-colors ${loading ? "text-blue-400 animate-pulse" : "text-gray-400 dark:text-slate-500"}`} />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => query && setOpen(true)}
                    placeholder="Pesquisar..."
                    className="bg-transparent text-sm text-gray-600 dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500 outline-none w-full"
                />
                {query && (
                    <button onClick={() => { setQuery(""); setOpen(false); }} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                        <X size={13} />
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-[60] animate-fade-in-down">
                    {results.length === 0 ? (
                        <div className="px-4 py-5 text-center text-sm text-gray-400 dark:text-slate-500">
                            Sem resultados para <span className="font-semibold">"{query}"</span>
                        </div>
                    ) : (
                        <>
                            {results.filter(r => r.type === "room").length > 0 && (
                                <div>
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salas</span>
                                    </div>
                                    {results.filter(r => r.type === "room").map(item => (
                                        <button key={`r-${item.id}`} onClick={() => handleSelect(item)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors text-left">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Building2 size={13} className="text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500">{item.sub}</p>
                                            </div>
                                            {item.status && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusBadge[item.status] || "bg-gray-100 text-gray-500"}`}>
                                                    {statusLabel[item.status] || item.status}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.filter(r => r.type === "reservation").length > 0 && (
                                <div className={results.filter(r => r.type === "room").length > 0 ? "border-t border-gray-50 dark:border-slate-700" : ""}>
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reservas</span>
                                    </div>
                                    {results.filter(r => r.type === "reservation").map(item => (
                                        <button key={`res-${item.id}`} onClick={() => handleSelect(item)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors text-left">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                                <CalendarCheck size={13} className="text-emerald-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{item.sub}</p>
                                            </div>
                                            {item.status && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusBadge[item.status] || "bg-gray-100 text-gray-500"}`}>
                                                    {statusLabel[item.status] || item.status}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="px-4 py-2 border-t border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                                <p className="text-[10px] text-gray-400 text-center">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── NavItem com suporte a collapsed (tooltip) ─── */
function NavItem({ to, icon: Icon, label, onClick, collapsed }) {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <div className="relative group/item">
            <Link
                to={to}
                onClick={onClick}
                className={`flex items-center rounded-xl text-sm font-medium transition-all
                    ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"}
                    ${active
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/60 hover:text-gray-900 dark:hover:text-slate-100"
                    }`}
            >
                <Icon size={17} className={active
                    ? "text-white shrink-0"
                    : "text-gray-400 dark:text-slate-500 group-hover/item:text-gray-600 dark:group-hover/item:text-slate-300 shrink-0"
                } />
                {!collapsed && <span className="flex-1 leading-none">{label}</span>}
                {!collapsed && active && <ChevronRight size={13} className="text-white/60 shrink-0" />}
            </Link>
            {/* Tooltip quando colapsada */}
            {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                </div>
            )}
        </div>
    );
}

function SectionLabel({ label, collapsed }) {
    if (collapsed) return <div className="mx-3 my-2 border-t border-gray-100 dark:border-slate-700/60" />;
    return (
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 pt-5 pb-1.5">
            {label}
        </p>
    );
}

const roleLabel = { admin: "Administrador", funcionario: "Funcionário", professor: "Professor" };

function SidebarContent({ onClose, collapsed, onToggleCollapse }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { canInstall, install } = usePWAInstall();
    const isAdmin = user?.role === "admin";
    const isStaff = user?.role === "admin" || user?.role === "funcionario";
    const [from] = getAvatarColors(user?.name || "");

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Logo + collapse button */}
            <div className={`flex items-center shrink-0 py-4 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <Logo className="w-8 h-8" />
                        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Roomly</span>
                    </div>
                )}
                {collapsed && <Logo className="w-8 h-8" />}
                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-all"
                        title={collapsed ? "Expandir" : "Retrair"}
                    >
                        <Menu size={15} />
                    </button>
                )}
            </div>

            {/* Search — só aparece expandida */}
            {!collapsed && (
                <div className="px-3 pb-3 shrink-0">
                    <GlobalSearch onClose={onClose} />
                </div>
            )}
            {collapsed && (
                <div className="px-2 pb-3 shrink-0">
                    <button
                        onClick={onToggleCollapse}
                        className="w-full flex items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-700/60 text-gray-400 dark:text-slate-500 hover:text-blue-500 transition-colors"
                        title="Expandir para pesquisar"
                    >
                        <Search size={15} />
                    </button>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-1.5 custom-scrollbar">
                <SectionLabel label="Principal" collapsed={collapsed} />
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} collapsed={collapsed} />
                <NavItem to="/rooms" icon={MapPin} label="Espaços" onClick={onClose} collapsed={collapsed} />
                <NavItem to="/my-reservations" icon={Calendar} label="Minhas Reservas" onClick={onClose} collapsed={collapsed} />

                <SectionLabel label="Suporte" collapsed={collapsed} />
                <NavItem to="/report-issue" icon={Wrench} label="Suporte Técnico" onClick={onClose} collapsed={collapsed} />

                {isStaff && (
                    <>
                        <SectionLabel label="Administração" collapsed={collapsed} />
                        <NavItem to="/manage-reports" icon={Wrench} label="Manutenção" onClick={onClose} collapsed={collapsed} />
                        {isAdmin && (
                            <>
                                <NavItem to="/manage-rooms" icon={Building2} label="Gerir Salas" onClick={onClose} collapsed={collapsed} />
                                <NavItem to="/manage-users" icon={Users} label="Gerir Utilizadores" onClick={onClose} collapsed={collapsed} />
                                <NavItem to="/manage-reservations" icon={BookOpen} label="Gerir Reservas" onClick={onClose} collapsed={collapsed} />
                            </>
                        )}
                    </>
                )}
            </nav>

            {/* Bottom */}
            <div className={`shrink-0 py-3 border-t border-gray-100 dark:border-slate-700/60 space-y-0.5 ${collapsed ? "px-1.5" : "px-1.5"}`}>

                {/* Instalar PWA */}
                {canInstall && (
                    <div className="relative group/install">
                        <button
                            onClick={install}
                            className={`w-full flex items-center rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all
                                ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"}`}
                        >
                            <Download size={17} className="shrink-0" />
                            {!collapsed && <span>Instalar App</span>}
                        </button>
                        {collapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/install:opacity-100 transition-opacity pointer-events-none z-50">
                                Instalar App
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                            </div>
                        )}
                    </div>
                )}

                {/* Theme */}
                <div className="relative group/theme">
                    <button
                        onClick={toggleTheme}
                        className={`w-full flex items-center rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/60 hover:text-gray-900 dark:hover:text-slate-100 transition-all
                            ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"}`}
                    >
                        {theme === "dark"
                            ? <Sun size={17} className="text-amber-400 shrink-0" />
                            : <Moon size={17} className="text-slate-400 shrink-0" />
                        }
                        {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
                    </button>
                    {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/theme:opacity-100 transition-opacity pointer-events-none z-50">
                            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                        </div>
                    )}
                </div>

                <NavItem to="/settings" icon={Settings} label="Definições" onClick={onClose} collapsed={collapsed} />

                {/* Logout */}
                <div className="relative group/logout">
                    <button
                        onClick={logout}
                        className={`w-full flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all
                            ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"}`}
                    >
                        <LogOut size={17} className="shrink-0" />
                        {!collapsed && <span>Terminar Sessão</span>}
                    </button>
                    {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/logout:opacity-100 transition-opacity pointer-events-none z-50">
                            Terminar Sessão
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                        </div>
                    )}
                </div>

                {/* User card */}
                {!collapsed ? (
                    <Link
                        to="/settings"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-gray-50 dark:bg-slate-700/40 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-700/60"
                    >
                        <Avatar name={user?.name} size="md" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate leading-tight">{user?.name || "Utilizador"}</p>
                            <p className="text-[11px] truncate mt-0.5" style={{ color: from }}>{roleLabel[user?.role] || user?.role}</p>
                        </div>
                    </Link>
                ) : (
                    <div className="relative group/user flex justify-center mt-1">
                        <Link to="/settings" onClick={onClose}>
                            <Avatar name={user?.name} size="md" />
                        </Link>
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none z-50">
                            {user?.name || "Utilizador"}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mq = typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)") : null;

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "true");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => mq ? mq.matches : false);
    const location = useLocation();

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (!mq) return;
        setIsDesktop(mq.matches);
        const handler = (e) => setIsDesktop(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const toggleCollapse = () => {
        setCollapsed(v => {
            const next = !v;
            localStorage.setItem("sidebar_collapsed", String(next));
            return next;
        });
    };

    return (
        <>
            {/* Desktop */}
            {isDesktop && (
                <aside
                    className={`flex flex-col shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700/60 shadow-sm transition-all duration-300 ease-in-out z-30 ${collapsed ? "w-16" : "w-60"}`}
                >
                    <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
                </aside>
            )}

            {/* Mobile top bar */}
            {!isDesktop && (
            <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/60 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <Logo className="w-7 h-7" />
                    <span className="text-base font-bold text-gray-900 dark:text-white">Roomly</span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Menu size={20} />
                </button>
            </header>
            )}

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-left">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-slate-700/60 shrink-0">
                            <div className="flex items-center gap-2">
                                <Logo className="w-7 h-7" />
                                <span className="text-base font-bold text-gray-900 dark:text-white">Roomly</span>
                            </div>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="h-[calc(100%-60px)]">
                            <SidebarContent onClose={() => setMobileOpen(false)} collapsed={false} />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
