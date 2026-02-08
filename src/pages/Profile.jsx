import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext"; // <--- USAR CONTEXT

export default function Profile() {
    const { user } = useAuth(); // <--- USER DO CONTEXTO
    const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm_password: "" });

    const handleChange = (name, value) => {
        setPasswords({ ...passwords, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) return alert("A nova senha e a confirmação não coincidem!");
        if (passwords.new_password.length < 5) return alert("A nova senha deve ter pelo menos 5 caracteres.");

        try {
            const res = await authService.updatePassword({
                id: user.id, // <--- USA O ID DO CONTEXTO
                old_password: passwords.old_password,
                new_password: passwords.new_password
            });

            if (res.status === "sucesso") {
                alert("Sucesso! Usa a nova senha na próxima vez.");
                setPasswords({ old_password: "", new_password: "", confirm_password: "" });
            } else {
                alert("Erro: " + res.mensagem);
            }
        } catch (error) { console.error("Erro:", error); }
    };

    return (
        <Layout title="Meu Perfil">
            <div className="flex justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <User size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                    </div>

                    <hr className="mb-6 border-gray-100" />
                    <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Lock size={18} /> Alterar Senha
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Senha Atual" type="password" value={passwords.old_password} onChange={(val) => handleChange("old_password", val)} required />
                        <Input label="Nova Senha" type="password" value={passwords.new_password} onChange={(val) => handleChange("new_password", val)} required />
                        <Input label="Confirmar Nova Senha" type="password" value={passwords.confirm_password} onChange={(val) => handleChange("confirm_password", val)} required />

                        <Button type="submit" variant="primary" className="w-full mt-4">
                            <Save size={20} /> Atualizar Senha
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}