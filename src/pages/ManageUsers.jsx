import { useEffect, useState, useRef } from "react";
import { Trash2, UserPlus, X, ShieldAlert, Briefcase, BookOpen, RotateCcw, Users, Mail, Lock, Save, User, Search, Filter, ChevronDown } from "lucide-react";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

export default function ManageUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("todos");
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;
    const filterRef = useRef(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "professor" });

    const FILTERS = [
        { key: "todos",       label: "Todos"        },
        { key: "professor",   label: "Professores"  },
        { key: "funcionario", label: "Funcionários" },
        { key: "admin",       label: "Admins"       },
        { key: "inativo",     label: "Inativos"     },
    ];

    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        carregarUsers();
    }, []);

    const carregarUsers = () => {
        userService.getAll()
            .then((data) => setUsers(data))
            .catch((err) => console.error(err));
    };

    const openCreate = () => {
        setFormData({ name: "", email: "", password: "", role: "professor" });
        setShowForm(true);
    };

    const closeForm = () => setShowForm(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (formData.name.trim().length < 3) { toast.error("O nome deve ter pelo menos 3 caracteres."); return; }
        if (formData.name.trim().length > 100) { toast.error("O nome não pode ultrapassar 100 caracteres."); return; }
        if (formData.password.length < 6) { toast.error("A palavra-passe deve ter pelo menos 6 caracteres."); return; }
        if (!/[A-Za-z]/.test(formData.password)) { toast.error("A palavra-passe deve conter pelo menos uma letra."); return; }
        if (!/[0-9]/.test(formData.password)) { toast.error("A palavra-passe deve conter pelo menos um número."); return; }
        try {
            const res = await userService.create(formData);
            if (res.status === "sucesso") {
                toast.success("Utilizador criado com sucesso!");
                closeForm();
                carregarUsers();
            } else {
                toast.error(translateMessage(res.mensagem));
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar utilizador.");
        }
    };

    const handleToggleStatus = async (userTarget) => {
        const novoStatus = userTarget.is_active == 1 ? 0 : 1;
        const acao = novoStatus ? 'ativar' : 'desativar';

        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Tens a certeza que queres {acao} <strong>{userTarget.name}</strong>?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        const res = await userService.toggleStatus(userTarget.id, novoStatus);
                        if (res.status === "sucesso") {
                            setUsers(users.map(u => u.id === userTarget.id ? { ...u, is_active: novoStatus } : u));
                            toast.success(`Utilizador ${acao === 'ativar' ? 'ativado' : 'desativado'}!`);
                        }
                    }} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Confirmar</button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">Cancelar</button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await userService.changeRole(userId, newRole);
            if (res.status === "sucesso") {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                toast.success("Cargo atualizado!");
            } else {
                toast.error(translateMessage(res.mensagem) || "Erro ao alterar cargo.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao alterar cargo.");
        }
    };

    const filteredUsers = users.filter(u => {
        const term = search.toLowerCase();
        const matchSearch = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
        const matchFilter =
            filter === "todos"       ? true :
            filter === "inativo"     ? u.is_active == 0 :
            u.role === filter;
        return matchSearch && matchFilter;
    });

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                        <Users size={22} className="text-blue-500" />
                        Gerir Utilizadores
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        Cria, edita e gere os utilizadores da plataforma.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors shrink-0"
                >
                    <UserPlus size={16} /> Novo Utilizador
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeForm}>
                    <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />
                    <div
                        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                    <UserPlus size={14} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Novo Utilizador</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Preenche os dados para criar o acesso institucional</p>
                                </div>
                            </div>
                            <button onClick={closeForm} className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nome completo</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Ana Sousa"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email institucional</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Ex: ana.sousa@escola.pt"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Palavra-passe + Cargo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Palavra-passe</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Mín. 6 caracteres"
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cargo</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="cursor-pointer w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                                    >
                                        <option value="professor">Professor</option>
                                        <option value="funcionario">Funcionário</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeForm}
                                    className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors">
                                    <Save size={14} /> Criar Utilizador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pesquisa + filtro */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Pesquisar por nome ou email..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>
                <div ref={filterRef} className="relative shrink-0">
                    <button
                        onClick={() => setFilterOpen(v => !v)}
                        className="cursor-pointer relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-150"
                    >
                        <Filter size={14} />
                        Filtro
                        <ChevronDown size={13} className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`} />
                        {filter !== "todos" && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                        )}
                    </button>
                    {filterOpen && (
                        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden z-20">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => { setFilter(f.key); setPage(1); setFilterOpen(false); }}
                                    className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${
                                        filter === f.key
                                            ? "bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-slate-100 font-semibold"
                                            : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col gap-3">
                {filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((u) => {
                    const isMe = currentUser && Number(u.id) === Number(currentUser.id);
                    const isInactive = u.is_active == 0;
                    return (
                        <div key={u.id} className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3 ${isInactive ? "opacity-60 grayscale" : ""}`}>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    {u.role === 'admin' && <ShieldAlert size={16} className="text-purple-600 shrink-0" />}
                                    {u.role === 'professor' && <BookOpen size={16} className="text-blue-600 shrink-0" />}
                                    {u.role === 'funcionario' && <Briefcase size={16} className="text-orange-600 shrink-0" />}
                                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">{u.name} {isMe && <span className="text-xs text-gray-400">(Eu)</span>}</span>
                                </div>
                                {!isMe && (
                                    <button onClick={() => handleToggleStatus(u)} title={isInactive ? "Ativar" : "Desativar"}
                                        className={`cursor-pointer shrink-0 p-2 rounded-lg transition-colors ${isInactive ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}`}>
                                        {isInactive ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-slate-400">Cargo:</span>
                                {isMe ? (
                                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{u.role === "admin" ? "Admin" : u.role === "funcionario" ? "Funcionário" : "Professor"}</span>
                                ) : (
                                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={isInactive} className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-600 dark:text-slate-300">
                                        <option value="professor">Professor</option>
                                        <option value="funcionario">Funcionário</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                        <tr>
                            <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Nome</th>
                            <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Cargo</th>
                            <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-700/60">
                        {filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((u) => {
                            const isMe = currentUser && Number(u.id) === Number(currentUser.id);
                            const isInactive = u.is_active == 0;
                            return (
                                <tr key={u.id} className={isInactive ? "bg-gray-50 dark:bg-slate-900/30 opacity-60 grayscale" : "hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"}>
                                    <td className="px-5 py-4 font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        {u.role === 'admin' && <ShieldAlert size={16} className="text-purple-600" />}
                                        {u.role === 'professor' && <BookOpen size={16} className="text-blue-600" />}
                                        {u.role === 'funcionario' && <Briefcase size={16} className="text-orange-600" />}
                                        {u.name} {isMe && <span className="text-xs text-gray-400">(Eu)</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">{u.email}</td>
                                    <td className="px-5 py-4">
                                        {isMe ? (
                                            <span className="text-sm font-bold text-gray-400 dark:text-slate-500 select-none">
                                                {u.role === "admin" ? "Admin" : u.role === "funcionario" ? "Funcionário" : "Professor"}
                                            </span>
                                        ) : (
                                            <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={isInactive} className="bg-transparent font-bold text-sm outline-none cursor-pointer disabled:cursor-not-allowed text-slate-600 dark:text-slate-300">
                                                <option value="professor">Professor</option>
                                                <option value="funcionario">Funcionário</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end">
                                            {isMe ? (
                                                <span className="text-xs text-gray-300 dark:text-slate-600 select-none">—</span>
                                            ) : (
                                                <button onClick={() => handleToggleStatus(u)} title={isInactive ? "Ativar utilizador" : "Desativar utilizador"}
                                                    className={`cursor-pointer p-2 rounded-lg transition-colors ${isInactive ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}`}>
                                                    {isInactive ? <RotateCcw size={15} /> : <Trash2 size={15} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <Pagination page={page} totalPages={Math.ceil(filteredUsers.length / PER_PAGE)} onChange={setPage} />
            </div>
        </Layout>
    );
}
