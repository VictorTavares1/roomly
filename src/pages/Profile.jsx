import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm_password: "" });

    const handleChange = (name, value) => {
        setPasswords({ ...passwords, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            toast.error("A nova palavra-passe e a confirmação não coincidem!");
            return;
        }
        if (passwords.new_password.length < 5) {
            toast.error("A nova palavra-passe deve ter pelo menos 5 caracteres.");
            return;
        }

        try {
            const res = await authService.updatePassword({
                current_password: passwords.old_password,
                new_password: passwords.new_password
            });

            if (res.status === "sucesso") {
                toast.success("Palavra-passe atualizada com sucesso!");
                setPasswords({ old_password: "", new_password: "", confirm_password: "" });
            } else {
                toast.error(res.mensagem || "Erro ao atualizar palavra-passe.");
            }
        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao atualizar palavra-passe.");
        }
    };

    return (
        <Layout title="Meu Perfil">
            <div className="flex justify-center">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 w-full max-w-lg transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                            <User size={36} className="text-gray-400 dark:text-slate-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-200">{user?.name}</h1>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
                    </div>

                    <hr className="mb-6 border-gray-100 dark:border-slate-700" />
                    <h2 className="text-lg font-bold text-gray-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Lock size={18} /> Alterar Palavra-passe
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Palavra-passe Atual" type="password" value={passwords.old_password} onChange={(val) => handleChange("old_password", val)} required />
                        <Input label="Nova Palavra-passe" type="password" value={passwords.new_password} onChange={(val) => handleChange("new_password", val)} required />
                        <Input label="Confirmar Nova Palavra-passe" type="password" value={passwords.confirm_password} onChange={(val) => handleChange("confirm_password", val)} required />

                        <Button type="submit" variant="primary" className="w-full mt-4">
                            <Save size={20} /> Atualizar Palavra-passe
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
