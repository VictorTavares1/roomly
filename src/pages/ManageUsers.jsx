import { useEffect, useState } from "react";
import { Trash2, UserPlus, X, ShieldAlert, Briefcase, BookOpen, RotateCcw } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext"; // <--- IMPORTAR CONTEXTO

export default function ManageUsers() {
    // Renomeamos 'user' para 'currentUser' para não confundir com o 'map(user)' abaixo
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
                alert("Utilizador criado!");
                setShowForm(false);
                setFormData({ name: "", email: "", password: "", role: "professor" });
                carregarUsers();
            } else {
                alert("Erro: " + res.mensagem);
            }
        } catch (error) { console.error(error); }
    };

    const handleToggleStatus = async (userTarget) => {
        const novoStatus = userTarget.is_active == 1 ? 0 : 1;
        if (!window.confirm(`Tens a certeza que queres ${novoStatus ? 'ativar' : 'desativar'} este utilizador?`)) return;

        const res = await userService.toggleStatus(userTarget.id, novoStatus);
        if (res.status === "sucesso") {
            setUsers(users.map(u => u.id === userTarget.id ? { ...u, is_active: novoStatus } : u));
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        const res = await userService.changeRole(userId, newRole);
        if (res.status === "sucesso") {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    };

    return (
        <Layout title="Gerir Utilizadores">
            <div className="mb-6 flex justify-end">
                <Button variant={showForm ? "danger" : "primary"} onClick={() => setShowForm(!showForm)}>
                    {showForm ? <><X size={20} /> Cancelar</> : <><UserPlus size={20} /> Novo Utilizador</>}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8 animate-fade-in">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nome" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                        <Input label="Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                        <Input label="Senha" type="password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required />
                        <Select label="Cargo" value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })}
                            options={[{ id: 'professor', name: 'Professor' }, { id: 'funcionario', name: 'Funcionário' }, { id: 'admin', name: 'Admin' }]}
                        />
                        <div className="md:col-span-2 pt-2">
                            <Button type="submit" variant="success" className="w-full">Confirmar Criação</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
                        <tr><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Cargo</th><th className="p-4 text-center">Estado</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => {
                            // Verifica se sou eu mesmo para desativar botões
                            const isMe = currentUser && u.id === currentUser.id;
                            const isInactive = u.is_active == 0;
                            return (
                                <tr key={u.id} className={isInactive ? "bg-gray-50 opacity-60 grayscale" : "hover:bg-gray-50"}>
                                    <td className="p-4 font-medium flex items-center gap-2 text-slate-700">
                                        {u.role === 'admin' && <ShieldAlert size={16} className="text-purple-600" />}
                                        {u.role === 'professor' && <BookOpen size={16} className="text-blue-600" />}
                                        {u.role === 'funcionario' && <Briefcase size={16} className="text-orange-600" />}
                                        {u.name} {isMe && <span className="text-xs text-gray-400">(Eu)</span>}
                                    </td>
                                    <td className="p-4 text-gray-500">{u.email}</td>
                                    <td className="p-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            disabled={isMe || isInactive}
                                            className="bg-transparent font-bold text-sm outline-none cursor-pointer disabled:cursor-not-allowed text-slate-600"
                                        >
                                            <option value="professor">Professor</option>
                                            <option value="funcionario">Funcionário</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button variant={isInactive ? "success" : "danger"} onClick={() => handleToggleStatus(u)} disabled={isMe} className="!p-2 !rounded-full !w-10 !h-10 mx-auto">
                                            {isInactive ? <RotateCcw size={18} /> : <Trash2 size={18} />}
                                        </Button>
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