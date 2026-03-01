import { Link } from "react-router-dom";
import { ArrowRight, School, Laptop, CheckCircle, Shield, Building2 } from "lucide-react";
import Logo from "../components/Logo";
import campusBg from "../assets/campus-bg.jpg";

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">

            {/* === NAVBAR === */}
            <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:px-12 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    {/* LOGO NOVO AQUI */}
                    <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white tracking-wide leading-none">Roomly</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Education Platform</span>
                    </div>
                </div>
                <Link
                    to="/login"
                    className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
                >
                    Aceder ao Sistema
                </Link>
            </nav>

            {/* === HERO SECTION === */}
            <div className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden">
                {/* Background Institucional */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${campusBg})`
                    }}
                ></div>
                {/* Overlay Sóbrio (Slate/Navy) */}
                <div className="absolute inset-0 z-0 bg-slate-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>

                <div className="relative z-10 container mx-auto px-6 text-center text-white mt-16">

                    {/* Badge Institucional */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Plataforma Oficial de Gestão</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">
                        Gestão Centralizada de <br className="hidden md:block" />
                        <span className="text-slate-200">
                            Recursos Escolares
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                        Sistema integrado para agendamento de espaços, requisição de equipamentos e gestão de manutenção.
                        Acesso restrito a docentes e funcionários autorizados.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
                        <Link
                            to="/login"
                            className="w-full md:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold text-base shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-3 border border-blue-500/50 hover:-translate-y-0.5"
                        >
                            Entrar na Área Reservada <ArrowRight size={18} />
                        </Link>
                        <a
                            href="#features"
                            className="w-full md:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/20 hover:border-white/30 rounded-lg font-medium text-base transition-all backdrop-blur-sm"
                        >
                            Consultar Funcionalidades
                        </a>
                    </div>

                    {/* Cards Informativos (Estilo Administrativo - Glassmorphism) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
                        <div className="p-6 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md flex flex-col gap-4 hover:bg-slate-800/50 transition-colors shadow-lg">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400 border border-white/5">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg mb-1">Agendamento</h3>
                                <p className="text-sm text-slate-300">Reserva de salas e laboratórios em tempo real, sem conflitos.</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md flex flex-col gap-4 hover:bg-slate-800/50 transition-colors shadow-lg">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-400 border border-white/5">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg mb-1">Controlo e Segurança</h3>
                                <p className="text-sm text-slate-300">Permissões hierarquizadas para direção, docentes e staff.</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md flex flex-col gap-4 hover:bg-slate-800/50 transition-colors shadow-lg">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-amber-400 border border-white/5">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg mb-1">Manutenção</h3>
                                <p className="text-sm text-slate-300">Registo centralizado de avarias e pedidos de intervenção.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-0 w-full py-4 text-center z-10 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
                <p className="text-xs text-slate-500">
                    © 2026 Roomly Education Platform. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
}