import { useState, useEffect } from "react";
import { User, Lock, Shield, Save, CheckCircle, AlertTriangle } from "lucide-react";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { userService, authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

export default function Settings() {
    const { user, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const getInitials = (n) => {
        if (!n) return "U";
        const names = n.split(' ');
        return names.length === 1 ? names[0].charAt(0) : names[0].charAt(0) + names[names.length - 1].charAt(0);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const res = await userService.updateProfile({
                id: user.id,
                name: name,
                email: email
            });

            if (res.status === "sucesso") {
                setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
                if (res.user) {
                    updateUser(res.user);
                }
            } else {
                setMessage({ type: "error", text: translateMessage(res.mensagem) });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erro ao atualizar perfil." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "As novas palavras-passe não coincidem!" });
            setLoading(false);
            return;
        }

        try {
            const res = await authService.updatePassword({
                user_id: user.id,
                current_password: currentPassword,
                new_password: newPassword
            });

            if (res.status === "sucesso") {
                setMessage({ type: "success", text: "Palavra-passe alterada! Por favor entra novamente." });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: "error", text: translateMessage(res.mensagem) });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Erro ao mudar palavra-passe." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200 mb-6">Definições </h1>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* MENU LATERAL */}
                <div className="w-full lg:w-64 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left
                        ${activeTab === "profile" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-blue-100 dark:border-slate-600" : "text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-700"}`}
                    >
                        <User size={20} /> Meu Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left
                        ${activeTab === "security" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-blue-100 dark:border-slate-600" : "text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-700"}`}
                    >
                        <Lock size={20} /> Segurança
                    </button>
                </div>

                {/* CONTEÚDO */}
                <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[500px] transition-colors">

                    {/* Feedback */}
                    {message && (
                        <div className={`p-4 mb-6 rounded-xl text-center font-medium flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {/* ABA PERFIL */}
                    {activeTab === "profile" && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                    {getInitials(user?.name)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{user?.name}</h2>
                                    <p className="text-gray-500 dark:text-slate-400">{user?.email}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 text-xs font-bold uppercase rounded-full text-gray-600 dark:text-slate-300">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                <Input label="Nome de Exibição" value={name} onChange={setName} icon={User} />
                                <Input label="Email" type="email" value={email} onChange={setEmail} icon={User} />
                                <div className="pt-4">
                                    <Button type="submit" variant="primary" isLoading={loading}>
                                        <Save size={18} /> Guardar Alterações
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA SEGURANÇA */}
                    {activeTab === "security" && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Alterar Palavra-passe</h2>
                            <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm">Escolhe uma palavra-passe forte.</p>

                            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                                <Input label="Palavra-passe Atual" type="password" value={currentPassword} onChange={setCurrentPassword} icon={Lock} required />
                                <hr className="border-gray-100 dark:border-slate-700" />
                                <Input label="Nova Palavra-passe" type="password" value={newPassword} onChange={setNewPassword} icon={Shield} required />
                                <Input label="Confirmar Nova Palavra-passe" type="password" value={confirmPassword} onChange={setConfirmPassword} icon={Shield} required />
                                <Button type="submit" variant="primary" isLoading={loading} className="mt-4 w-full">
                                    Atualizar Palavra-passe
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}