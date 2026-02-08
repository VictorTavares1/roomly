import { Link } from "react-router-dom";
import { Calendar, Clock, Shield, ArrowRight, CheckCircle, LayoutDashboard } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* === NAVBAR (Menu de Topo) === */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <LayoutDashboard size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-blue-900">Roomly</span>
                    </div>

                    {/* Botão de Login */}
                    <Link
                        to="/login"
                        className="px-6 py-2.5 rounded-full font-bold text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                    >
                        Área de Cliente
                    </Link>
                </div>
            </nav>

            {/* === HERO SECTION (A parte principal) === */}
            <header className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">NOVO</span>
                        Gestão de Salas Escolar 2.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-blue-900 mb-6 leading-tight">
                        Adeus papel.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Olá organização.</span>
                    </h1>

                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        O sistema definitivo para professores e alunos. Reserva salas, consulta horários e gere equipamentos em segundos. Simples, rápido e intuitivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            Começar Agora <ArrowRight size={20} />
                        </Link>
                        <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-lg hover:border-blue-200 hover:text-blue-600 transition-all">
                            Saber Mais
                        </button>
                    </div>
                </div>
            </header>

            {/* === FEATURES (Vantagens) === */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800">Porquê usar o Roomly?</h2>
                        <p className="text-gray-500 mt-2">Tudo o que precisas para gerir o espaço escolar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                <Calendar size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Reservas Inteligentes</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Calendário visual para evitar conflitos. Vê quem está a usar a sala e marca o teu horário num clique.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                <Clock size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Tempo Real</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Dashboard atualizado ao segundo. Estatísticas de uso, salas livres agora e gestão de permissões.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Segurança Total</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Controlo de acesso por cargos (Admin/Professor). Os teus dados e reservas estão sempre protegidos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <span className="font-bold text-xl">Roomly</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        &copy; 2024 Projeto Roomly. Feito com 💙 na Escola.
                    </div>
                </div>
            </footer>
        </div>
    );
}