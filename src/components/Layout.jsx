import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-300">

            {/* === SIDEBAR === */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 dark:bg-slate-950 transition-all duration-300 ease-in-out transform 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 md:static md:flex-shrink-0`}
            >
                <Sidebar />

                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 text-white md:hidden hover:bg-white/10 rounded-lg p-1"
                >
                    <X size={24} />
                </button>
            </div>

            {/* === CONTEÚDO PRINCIPAL === */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">

                {/* === BARRA DE TOPO MOBILE === */}
                <div className="md:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm z-40 transition-colors">

                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <span className="font-bold text-blue-900 dark:text-blue-400 text-lg flex items-center gap-2">
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