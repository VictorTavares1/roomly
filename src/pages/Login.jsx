import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, Mail } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("1. A enviar pedido..."); // Debug
      const data = await authService.login(email, password);
      console.log("2. Resposta recebida do PHP:", data); // Debug

      // === AQUI ESTAVA O PROBLEMA PROVAVELMENTE ===
      // O teu PHP envia "status": "sucesso"
      // Temos de verificar exatamente essa palavra!
      if (data.status === "sucesso") {
        console.log("3. Login aprovado! A guardar dados...");

        // Guarda os dados no contexto
        login(data.user);

        console.log("4. A redirecionar para o Dashboard...");
        // Força a ida para o dashboard
        navigate("/dashboard", { replace: true });
      } else {
        console.warn("3. PHP disse que não:", data.mensagem);
        setError(data.mensagem || "Erro desconhecido no login.");
        setLoading(false);
      }
    } catch (err) {
      console.error("ERRO CRÍTICO NO REACT:", err);
      setError("Erro de conexão. Confirma se o XAMPP está ligado.");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-90 z-10"></div>
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover" alt="Office" />
        <div className="relative z-20 text-white p-12 max-w-lg">
          <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl w-fit mb-6 shadow-xl"><span className="text-4xl">🚀</span></div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Gestão de Espaços Simplificada.</h1>
          <p className="text-blue-100 text-lg leading-relaxed">O Roomly ajuda escolas e empresas a organizar reservas.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta! 👋</h2>
            <p className="text-gray-500">Introduz os teus dados para entrar.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm flex items-center animate-fade-in">⚠️ {error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <Input label="Email" type="email" placeholder="exemplo@escola.pt" value={email} onChange={setEmail} icon={Mail} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={setPassword} icon={Lock} required />

            <Button type="submit" variant="primary" className="w-full py-4 text-lg" isLoading={loading}>
              <LogIn size={20} /> Entrar no Sistema
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-400">Esqueceste-te da senha? Contacta o <span className="text-blue-600 font-bold cursor-pointer">Admin</span>.</p>
        </div>
      </div>
    </div>
  );
}