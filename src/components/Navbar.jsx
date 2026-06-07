import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Search, ChevronDown, Sun, Moon, Settings,
    LogOut, MapPin, Calendar, AlertTriangle,
    ClipboardList, Wrench, Users, BookOpen, LayoutDashboard,
    Menu, X, Building2, CalendarCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";
import { roomService, reservationService } from "../services/api";
import { getAvatarColors, getInitials } from "../utils/avatar";

/* ─── Pesquisa Global ─── */
function GlobalSearch() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
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
                .map(r => ({
                    type: "room",
                    id: r.id,
                    title: r.name,
                    sub: r.type || "Sala",
                    status: r.status,
                    room: r,
                }));

            const resHits = (reservations || [])
                .filter(r =>
                    (r.room_name || "").toLowerCase().includes(ql) ||
                    (r.purpose || "").toLowerCase().includes(ql)
                )
                .slice(0, 4)
                .map(r => ({
                    type: "reservation",
                    id: r.id,
                    title: r.room_name,
                    sub: r.purpose || "Sem motivo",
                    date: r.start_time?.slice(0, 10),
                    status: r.status,
                }));

            setResults([...roomHits, ...resHits]);
            setOpen(true);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce 280ms
    useEffect(() => {
        const t = setTimeout(() => search(query), 280);
        return () => clearTimeout(t);
    }, [query, search]);

    const handleSelect = (item) => {
        setQuery("");
        setOpen(false);
        if (item.type === "room") {
            navigate("/rooms", { state: { highlight: item.id } });
        } else {
            navigate("/my-reservations");
        }
    };

    const statusBadge = {
        disponivel:  "bg-emerald-100 text-emerald-700",
        ocupada:     "bg-orange-100 text-orange-700",
        em_manutencao: "bg-red-100 text-red-700",
        confirmada:  "bg-blue-100 text-blue-700",
        cancelada:   "bg-gray-100 text-gray-500",
        concluida:   "bg-gray-100 text-gray-500",
    };
    const statusLabel = {
        disponivel: "Disponível", ocupada: "Ocupada",
        em_manutencao: "Manutenção", confirmada: "Confirmada",
        cancelada: "Cancelada", concluida: "Concluída",
    };

    return (
        <div ref={wrapperRef} className="relative hidden lg:block">
            <div className={`flex items-center gap-2 bg-gray-50 dark:bg-slate-700/60 border rounded-xl px-3 py-2 w-60 transition-all
                ${open ? "border-blue-400 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-slate-600/60"}
                focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20`}>
                <Search size={14} className={`shrink-0 transition-colors ${loading ? "text-blue-400 animate-pulse" : "text-gray-400 dark:text-slate-500"}`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => query && setOpen(true)}
                    placeholder="Procurar sala ou reserva..."
                    className="bg-transparent text-sm text-gray-600 dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500 outline-none w-full"
                />
                {query && (
                    <button onClick={() => { setQuery(""); setOpen(false); }} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                        <X size={13} />
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-down">
                    {results.length === 0 ? (
                        <div className="px-4 py-5 text-center text-sm text-gray-400 dark:text-slate-500">
                            Sem resultados para <span className="font-semibold text-gray-600 dark:text-slate-300">"{query}"</span>
                        </div>
                    ) : (
                        <>
                            {/* Salas */}
                            {results.filter(r => r.type === "room").length > 0 && (
                                <div>
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Salas</span>
                                    </div>
                                    {results.filter(r => r.type === "room").map(item => (
                                        <button key={`r-${item.id}`} onClick={() => handleSelect(item)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors text-left">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Building2 size={14} className="text-blue-500" />
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

                            {/* Reservas */}
                            {results.filter(r => r.type === "reservation").length > 0 && (
                                <div className={results.filter(r => r.type === "room").length > 0 ? "border-t border-gray-50 dark:border-slate-700" : ""}>
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">As minhas reservas</span>
                                    </div>
                                    {results.filter(r => r.type === "reservation").map(item => (
                                        <button key={`res-${item.id}`} onClick={() => handleSelect(item)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors text-left">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                                <CalendarCheck size={14} className="text-emerald-500" />
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

                            <div className="px-4 py-2.5 border-t border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
                                    {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}


const roleLabel = { admin: "Administrador", funcionario: "Funcionário", professor: "Professor" };

function Avatar({ name, size = "md" }) {
    const [from, to] = getAvatarColors(name);
    const sizeClass = size === "md" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 shadow-sm font-bold text-white`}
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
            {getInitials(name)}
        </div>
    );
}

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
                        <Logo className="w-8 h-8" />
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
                    <GlobalSearch />

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
                            <Avatar name={user?.name} size="md" />
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
                                <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
                                    <Avatar name={user?.name} size="lg" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user?.email}</p>
                                        <span className="text-[10px] font-semibold mt-0.5 inline-block" style={{ color: getAvatarColors(user?.name)[0] }}>
                                            {roleLabel[user?.role] || user?.role}
                                        </span>
                                    </div>
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
