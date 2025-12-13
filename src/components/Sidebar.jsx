import { Home, Calendar, PlusCircle, MapPin, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-blue-800 text-white shadow-md"
            : "text-blue-100 hover:bg-blue-800 hover:text-white hover:shadow-md";
    };

    function handleLogout() {
        localStorage.removeItem("user");
        navigate('/');
    }

    return (
        <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-2xl h-screen fixed left-0 top-0 z-50">

            <div className="p-6 text-2xl font-bold tracking-wider flex items-center gap-2 border-b border-blue-800">
                🚀 Roomly
            </div>

            <nav className="flex-1 px-4 space-y-3 mt-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive('/dashboard')}`}>
                    <Home size={20} />
                    <span className="font-medium">Início</span>
                </button>

                <button
                    onClick={() => navigate('/rooms')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive('/rooms')}`}>
                    <MapPin size={20} />
                    <span className="font-medium">Ver Salas</span>
                </button>

                <button
                    onClick={() => navigate('/my-reservations')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive('/my-reservations')}`}>
                    <Calendar size={20} />
                    <span className="font-medium">Minhas Reservas</span>
                </button>

                <button
                    onClick={() => navigate('/new-reservation')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive('/new-reservation')}`}>
                    <PlusCircle size={20} />
                    <span className="font-medium">Nova Reserva</span>
                </button>

            </nav>

            {/* BOTÃO SAIR */}
            <div className="p-4 border-t border-blue-800 bg-blue-900">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-600/20 w-full rounded-xl transition-all cursor-pointer font-medium">
                    <LogOut size={20} />
                    <span>Terminar Sessão</span>
                </button>
            </div>
        </aside>
    );
}