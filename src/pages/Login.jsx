import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Eye, EyeOff, Loader } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { translateMessage } from "../utils/translations";
import { useFadeNavigate } from "../hooks/useFadeNavigate";

export default function Login() {
  const { login } = useAuth();
  const go = useFadeNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      go("/dashboard");
    } catch (err) {
      toast.error(translateMessage(err.message || "Email ou palavra-passe incorretos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── LADO ESQUERDO ── */}
      <div
        className="hidden md:flex relative w-[48%] shrink-0 flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1e66ff 0%, #4da3ff 100%)" }}
      >
        {/* Círculo decorativo topo-esquerda */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }} />
        {/* Círculo decorativo baixo-esquerda */}
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }} />
        {/* Círculo decorativo topo-direita */}
        <div className="absolute top-10 right-16 w-32 h-32 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }} />

        {/* Conteúdo central */}
        <div className="relative z-10 flex flex-col items-center text-center px-14 gap-6">
          <p className="text-white/80 text-lg font-medium tracking-wide">Bem Vindo ao</p>

          {/* Logo circular */}
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.3)" }}
          >
            <Logo className="w-24 h-24" />
          </div>

          <h1 className="text-white text-5xl font-black tracking-tight" style={{ letterSpacing: "-1px" }}>
            roomly
          </h1>

          <p className="text-white/65 text-sm leading-relaxed max-w-[240px]">
            Plataforma inteligente de gestão e reserva de salas institucionais.
          </p>
        </div>

        {/* ── CLOUD WAVE ── */}
        <svg
          className="absolute right-0 top-0 h-full"
          style={{ width: "140px" }}
          viewBox="0 0 140 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camada 4 – mais recuada */}
          <path
            d="M140,0
               C110,40 75,55 80,100
               C85,145 120,155 115,200
               C110,245 70,260 72,305
               C74,350 115,360 112,405
               C109,450 68,465 70,510
               C72,555 115,565 110,610
               C105,655 72,668 74,710
               C76,752 108,765 140,800
               L140,0 Z"
            fill="white" opacity="0.12"
          />
          {/* Camada 3 */}
          <path
            d="M140,0
               C115,35 82,52 86,98
               C90,144 124,153 120,200
               C116,247 77,263 79,308
               C81,353 120,362 117,408
               C114,454 74,468 76,514
               C78,560 120,568 115,615
               C110,662 76,673 78,716
               C80,758 112,768 140,800
               L140,0 Z"
            fill="white" opacity="0.22"
          />
          {/* Camada 2 */}
          <path
            d="M140,0
               C118,32 88,50 92,97
               C96,144 128,152 124,200
               C120,248 82,265 84,311
               C86,357 124,365 121,412
               C118,459 79,472 81,518
               C83,564 124,572 118,619
               C112,666 80,677 82,720
               C84,762 115,771 140,800
               L140,0 Z"
            fill="white" opacity="0.40"
          />
          {/* Camada 1 – frente, branco puro */}
          <path
            d="M140,0
               C122,30 95,48 98,96
               C101,144 132,151 128,200
               C124,249 88,266 90,313
               C92,360 130,368 127,416
               C124,464 86,476 88,523
               C90,570 130,577 124,624
               C118,671 86,681 88,724
               C90,767 120,775 140,800
               L140,0 Z"
            fill="white" opacity="1"
          />
        </svg>
      </div>

      {/* ── LADO DIREITO ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">

        {/* Logo mobile */}
        <div className="flex md:hidden flex-col items-center mb-8 gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #1e66ff, #4da3ff)" }}
          >
            <Logo className="w-10 h-10" />
          </div>
          <span className="text-2xl font-black text-gray-800">roomly</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Iniciar Sessão</h2>
          <p className="text-sm text-gray-400 mb-8">Acede à tua conta para continuar.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-blue-500 transition-all"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <input
                  type="email"
                  placeholder="nome@escola.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-300 outline-none"
                />
                <Mail size={16} className="text-gray-300 shrink-0" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Palavra-passe
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-blue-500 transition-all"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão login */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #1e66ff, #4da3ff)",
                  boxShadow: "0 4px 20px rgba(30,102,255,0.35)"
                }}
              >
                {loading ? <Loader className="animate-spin" size={18} /> : "Entrar"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs text-center text-gray-400">
            Problemas no acesso?{" "}
            <span className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors">
              Contacta os Serviços Administrativos.
            </span>
          </p>

          <p className="mt-4 text-xs text-center text-gray-300">
            © 2026 Roomly • Plataforma Oficial
          </p>
        </div>
      </div>
    </div>
  );
}
