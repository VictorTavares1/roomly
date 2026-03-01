import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import { translateMessage } from "../utils/translations";
import campusBg from "../assets/campus-bg.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(translateMessage(err.message || "Email ou palavra-passe incorretos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-slate-100">

      {/* FUNDO SÓBRIO */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${campusBg})`
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-slate-900/90 mix-blend-multiply"></div>

      <Link to="/" className="absolute top-6 left-6 z-20 text-slate-300 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium">
        <ArrowLeft size={18} /> Voltar ao Portal
      </Link>

      {/* CARD DE LOGIN INSTITUCIONAL COM GLASSMORPHISM */}
      <div className="relative z-10 w-full max-w-md p-10 m-4 bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl animate-fade-in-up border border-white/40 border-t-4 border-t-blue-700">

        {/* CABEÇALHO DO CARD */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/50 rounded-xl border border-white/50 shadow-sm">
              <Logo className="w-12 h-12 text-slate-800" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Área Reservada</h2>
          <p className="text-slate-600 text-sm font-medium">Acesso restrito a utilizadores autorizados.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50/80 border-l-4 border-red-500 text-red-700 text-sm font-medium backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Email Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-700 transition-colors" size={18} />
              <input
                type="email"
                placeholder="nome@escola.pt"
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-300/50 rounded-lg text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm backdrop-blur-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-700 transition-colors" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-300/50 rounded-lg text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm backdrop-blur-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm backdrop-blur-sm"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <>Iniciar Sessão <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Problemas no acesso? <span className="text-blue-700 hover:text-blue-900 hover:underline cursor-pointer transition-colors">Contacta os Serviços Administrativos.</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 text-xs text-slate-400">
        © 2026 Roomly Education • Plataforma Oficial
      </div>
    </div>
  );
}