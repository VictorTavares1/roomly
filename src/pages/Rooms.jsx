import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import RoomCard from "../components/RoomCard";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // 1. Ir buscar as salas ao Backend
        fetch("http://localhost/roomly_api/get_rooms.php")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((erro) => console.error("Erro ao carregar salas:", erro));
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
                <div className="max-w-6xl mx-auto">

                    <header className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Salas de Aula </h1>
                        <p className="text-gray-500">Escolhe uma sala para veres a disponibilidade.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {rooms.map((sala) => (
                            <RoomCard key={sala.id} room={sala} />
                        ))}
                    </div>

                </div>
            </main>
        </div>
    )
}