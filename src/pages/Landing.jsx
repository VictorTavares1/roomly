import { Link } from "react-router-dom";
import { ArrowRight, School, ShieldCheck, Zap } from "lucide-react";
import Logo from "../components/Logo";

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col font-sans">

            {/* === NAVBAR === */}
            <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:px-12">
                <div className="flex items-center gap-3">
                    {/* LOGO NOVO AQUI */}
                    <div className="bg-white/10 p-1 rounded-xl backdrop-blur-sm shadow-lg shadow-blue-500/20">
                        <Logo className="w-10 h-10" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Roomly</span>
                </div>
                <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105"
                >
                    Área de Cliente
                </Link>
            </nav>

            {/* === HERO SECTION === */}
            <div className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center scale-105 animate-slow-zoom"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2886&auto=format&fit=crop')"
                    }}
                ></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/80 to-gray-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 z-0 bg-black/40"></div>

                <div className="relative z-10 container mx-auto px-6 text-center text-white mt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-8 animate-fade-in-down">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-blue-100 uppercase tracking-wide">Gestão Escolar 2.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg">
                        Adeus Papel. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Olá Organização.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        O sistema definitivo para reservar salas, gerir equipamentos e reportar avarias.
                        Tudo num só lugar, acessível em qualquer dispositivo.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/login"
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Começar Agora <ArrowRight size={20} />
                        </Link>
                        <a
                            href="#features"
                            className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all"
                        >
                            Saber Mais
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300"><Zap size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Rápido</h3>
                                <p className="text-sm text-gray-400">Reservas em menos de 10 segundos.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Seguro</h3>
                                <p className="text-sm text-gray-400">Controlo total de acessos e cargos.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-300"><School size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Organizado</h3>
                                <p className="text-sm text-gray-400">Fim dos conflitos de horários.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-0 w-full py-6 text-center z-10">
                <p className="text-xs text-white/30">© 2026 Roomly. Feito com 💙 para a escola.</p>
            </footer>
        </div>
    );
}