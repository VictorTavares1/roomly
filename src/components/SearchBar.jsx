import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Pesquisar..." }) {
    return (
        <div className="relative w-full max-w-md">
            {/* Ícone da Lupa */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>

            {/* O Input em si */}
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {/* Botão de Limpar (X) - Só aparece se houver texto */}
            {value && (
                <button
                    onClick={() => onChange("")} // Limpa o texto
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}