import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { userService } from "../services/api";
import { Users, Trash2, Shield, GraduationCap, Plus, X } from "lucide-react"; // Importei ícones novos

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false); // Controla se o form está visível

    // Dados do formulário
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "professor"
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Tens a certeza que queres apagar "${name}"?`)) return;
        try {
            await userService.delete(id);
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            alert("Erro ao apagar.");
        }
    };

    // Função para criar novo utilizador
    const handleCreate = async (e) => {
        e.preventDefault(); // Não recarregar a página
        try {
            const response = await userService.create(formData);

            if (response.status === "sucesso") {
                alert("Utilizador criado!");
                setShowForm(false); // Esconder formulário
                setFormData({ name: "", email: "", password: "", role: "professor" }); // Limpar dados
                loadUsers(); // Recarregar a lista
            } else {
                alert("Erro: " + response.mensagem);
            }
        } catch (error) {
            alert("Erro ao criar utilizador.");
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
                <div className="max-w-5xl mx-auto">

                    <header className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Users className="text-blue-600" /> Gerir Utilizadores
                        </h1>

                        {/* BOTÃO PARA ABRIR O FORMULÁRIO */}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            {showForm ? <X size={20} /> : <Plus size={20} />}
                            {showForm ? "Cancelar" : "Novo Utilizador"}
                        </button>
                    </header>

                    {/* FORMULÁRIO DE CRIAÇÃO (Só aparece se showForm for true) */}
                    {showForm && (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8 animate-fade-in-down">
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Adicionar Nova Pessoa</h2>
                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text" placeholder="Nome Completo" required
                                    className="border p-3 rounded-lg w-full bg-gray-50"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="email" placeholder="Email da Escola" required
                                    className="border p-3 rounded-lg w-full bg-gray-50"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Senha Inicial" required
                                    className="border p-3 rounded-lg w-full bg-gray-50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <select
                                    className="border p-3 rounded-lg w-full bg-gray-50"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="professor">Professor</option>
                                    <option value="admin">Administrador</option>
                                    <option value="staff">Funcionário (Staff)</option>
                                </select>

                                <div className="md:col-span-2">
                                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">
                                        Confirmar Criação ✅
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* LISTA DE UTILIZADORES */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Nome</th>
                                    <th className="p-4 font-semibold text-gray-600">Email</th>
                                    <th className="p-4 font-semibold text-gray-600">Cargo</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                        <td className="p-4 text-gray-500">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : <GraduationCap size={12} />}
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>
        </div>
    );
}