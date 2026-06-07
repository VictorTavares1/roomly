import { useEffect, useState } from "react";
import { Trash2, UserPlus, X, ShieldAlert, Briefcase, BookOpen, RotateCcw, Users, Mail, Lock, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

export default function ManageUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "professor" });

    useEffect(() => {
        carregarUsers();
    }, []);

    const carregarUsers = () => {
        userService.getAll()
            .then((data) => setUsers(data))
            .catch((err) => console.error(err));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await userService.create(formData);
            if (res.status === "sucesso") {
                toast.success("Utilizador criado com sucesso!");
                setShowForm(false);
                setFormData({ name: "", email: "", password: "", role: "professor" });
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

    return (
        <Layout>
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
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 active:scale-95 shrink-0"
                    style={{ background: "linear-gradient(135deg, #1e66ff, #4da3ff)" }}
                >
                    {showForm ? <><X size={16} /> Cancelar</> : <><UserPlus size={16} /> Novo Utilizador</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-5"
                    style={{ animation: "chatSlideUp 0.2s ease both" }}>

                    {/* Header do formulário */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <UserPlus size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Novo Utilizador</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500">Preenche os dados para criar o acesso institucional</p>
                            </div>
                        </div>
                        <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nome completo</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Ana Sousa"
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email institucional</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Ex: ana.sousa@escola.pt"
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Palavra-passe */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Palavra-passe</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Cargo */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cargo</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            >
                                <option value="professor">Professor</option>
                                <option value="funcionario">Funcionário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {/* Botões */}
                        <div className="lg:col-span-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
                                style={{ background: "linear-gradient(135deg, #1e66ff, #4da3ff)" }}>
                                <Save size={14} /> Criar Utilizador
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col gap-3">
                {users.map((u) => {
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
                                    <button onClick={() => handleToggleStatus(u)} className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isInactive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" : "bg-red-50 dark:bg-red-900/30 text-red-500"}`}>
                                        {isInactive ? <><RotateCcw size={12} /> Ativar</> : <><Trash2 size={12} /> Desativar</>}
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
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold border-b dark:border-slate-700">
                        <tr><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Cargo</th><th className="p-4 text-center">Estado</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {users.map((u) => {
                            const isMe = currentUser && Number(u.id) === Number(currentUser.id);
                            const isInactive = u.is_active == 0;
                            return (
                                <tr key={u.id} className={isInactive ? "bg-gray-50 dark:bg-slate-900 opacity-60 grayscale" : "hover:bg-gray-50 dark:hover:bg-slate-700/50"}>
                                    <td className="p-4 font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        {u.role === 'admin' && <ShieldAlert size={16} className="text-purple-600" />}
                                        {u.role === 'professor' && <BookOpen size={16} className="text-blue-600" />}
                                        {u.role === 'funcionario' && <Briefcase size={16} className="text-orange-600" />}
                                        {u.name} {isMe && <span className="text-xs text-gray-400">(Eu)</span>}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-slate-400">{u.email}</td>
                                    <td className="p-4">
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
                                    <td className="p-4 text-center">
                                        {isMe ? (
                                            <span className="text-xs text-gray-300 dark:text-slate-600 select-none">—</span>
                                        ) : (
                                            <button onClick={() => handleToggleStatus(u)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isInactive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100" : "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100"}`}>
                                                {isInactive ? <><RotateCcw size={13} /> Ativar</> : <><Trash2 size={13} /> Desativar</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}