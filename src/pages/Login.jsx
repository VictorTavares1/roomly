import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo"; // <--- Importação do Logo

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
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">

      {/* FUNDO */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2886&auto=format&fit=crop')"
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/90 to-gray-900/95 mix-blend-multiply"></div>

      <Link to="/" className="absolute top-6 left-6 z-20 text-white/70 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Voltar ao Início
      </Link>

      {/* CARD DE LOGIN */}
      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">

        {/* CABEÇALHO DO CARD COM LOGO NOVO */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16 shadow-lg shadow-blue-600/40 rounded-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h2>
          <p className="text-blue-200 text-sm">Insere as tuas credenciais para entrar.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm text-center font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-blue-200 uppercase mb-2 ml-1">Email Escolar</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="email"
                placeholder="exemplo@escola.pt"
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black/30 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-blue-200 uppercase mb-2 ml-1">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black/30 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <>Entrar no Sistema <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Esqueceste-te da senha? <span className="text-blue-300 hover:text-white cursor-pointer transition-colors">Contacta a secretaria.</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 text-xs text-white/20">
        © 2024 Roomly Education
      </div>
    </div>
  );
}