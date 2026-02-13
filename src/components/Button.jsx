import { Loader2 } from "lucide-react";

export default function Button({
    children,       // O texto ou ícone dentro do botão
    onClick,        // O que acontece ao clicar
    type = "button",// "submit" ou "button"
    variant = "primary", // Cores: "primary" (azul), "danger" (vermelho), "success" (verde)
    disabled = false,    // Se está bloqueado
    isLoading = false,   // Se está a carregar
    className = ""       // Classes extra se precisares
}) {

    // Cores baseadas na variante
    const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30",
        success: "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30",
        warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30",
        outline: "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {children}
        </button>
    );
}