export default function Logo({ className = "w-10 h-10" }) {
    return (
        // Este é o SVG do nosso novo ícone profissional
        // A prop 'className' permite-nos controlar o tamanho onde quer que o usemos
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
            <defs>
                <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
            </defs>
            {/* Fundo Azul Arredondado */}
            <rect width="32" height="32" rx="6" fill="url(#a)" />
            {/* O Foguete/Porta Branco */}
            <path d="M16 4C16 4 10 14 10 18C10 21.3137 12.6863 24 16 24C19.3137 24 22 21.3137 22 18C22 14 16 4 16 4ZM16 6.8L19.2 16.4H12.8L16 6.8Z" fill="white" />
            {/* O "V" em baixo */}
            <path d="M14.5 26L16 29L17.5 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}