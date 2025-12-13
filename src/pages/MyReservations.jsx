import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";

export default function MyReservations() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            fetch(`http://localhost/roomly_api/get_my_reservations.php?user_id=${user.id}`)
                .then((res) => res.json())
                .then((data) => setReservations(data))
                .catch((err) => console.error("Erro:", err));
        }
    }, []);
    const handleDelete = async (id) => {
        if (!window.confirm("Tens a certeza que queres cancelar esta reserva?")) return;

        try {
            const response = await fetch("http://localhost/roomly_api/delete_reservation.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id })
            });

            const result = await response.json();

            if (result.status === "sucesso") {
                setReservations(reservations.filter((r) => r.id !== id));
                alert("Reserva cancelada com sucesso! 🗑️");
            } else {
                alert("Erro ao apagar: " + result.mensagem);
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-PT', options);
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Calendar className="text-blue-600" /> Minhas Reservas
                    </h1>

                    {reservations.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                            Ainda não tens reservas. Marca a tua primeira aula!
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                                    <tr>
                                        <th className="p-4">Sala</th>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Horário</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                                <MapPin size={16} className="text-blue-500" />
                                                {res.room_name}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {formatDate(res.start_time)}
                                            </td>
                                            <td className="p-4 text-gray-600 flex items-center gap-2">
                                                <Clock size={16} />
                                                {res.start_time.slice(11, 16)} - {res.end_time.slice(11, 16)}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    {res.status}
                                                </span>
                                            </td>

                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(res.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                                                    title="Cancelar Reserva">
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}