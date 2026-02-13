import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* === SIDEBAR (Inteligente) === */}
            {/* Nota: 'left-0' significa que o menu está encostado à ESQUERDA.
                Se isMobileMenuOpen for false, ele esconde-se para a esquerda (-translate-x-full).
            */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 transition-transform duration-300 ease-in-out transform 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 md:static md:flex-shrink-0`}
            >
                <Sidebar />

                {/* Botão X para fechar no telemóvel (dentro do menu azul) */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 text-white md:hidden hover:bg-white/10 rounded-lg p-1"
                >
                    <X size={24} />
                </button>
            </div>

            {/* === CONTEÚDO PRINCIPAL === */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">

                {/* === BARRA DE TOPO MOBILE (Só aparece em ecrãs pequenos) === */}
                {/* AQUI ESTÁ A MUDANÇA: Usei 'gap-4' e mudei a ordem dos elementos */}
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4 shadow-sm z-40">

                    {/* 1. O Botão agora está PRIMEIRO (à Esquerda) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* 2. O Logo vem DEPOIS */}
                    <span className="font-bold text-blue-900 text-lg flex items-center gap-2">
                        🚀 Roomly
                    </span>

                </div>

                {/* Área de Scroll do conteúdo */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>

            {/* Fundo escuro quando o menu está aberto no mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </div>
    );
}