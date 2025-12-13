import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Calendar, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "Utilizador" });

    useEffect(() => {
        const userGuardado = localStorage.getItem("user");
        if (userGuardado) {
            setUser(JSON.parse(userGuardado));
        } else {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 ml-64">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Olá, {user.name} 👋</h1>
                        <p className="text-gray-500 mt-1">Bem-vindo ao Roomly.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="btn btn-circle btn-ghost text-gray-500">
                            <Bell size={24} />
                        </button>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <div className="avatar placeholder">
                                <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center">
                                    <span className="text-xs font-bold">{user.name.charAt(0)}</span>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{user.role}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-white shadow-lg border-l-4 border-blue-500 p-6">
                        <h2 className="text-gray-500 text-sm font-bold">RESERVAS HOJE</h2>
                        <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
                    </div>

                    <div className="card bg-white shadow-lg border-l-4 border-green-500 p-6">
                        <h2 className="text-gray-500 text-sm font-bold">SALAS LIVRES</h2>
                        <p className="text-4xl font-bold text-gray-800 mt-2">5</p>
                    </div>
                </div>

            </main>
        </div>
    )
}