import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, AlignLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function NewReservation() {
    const navigate = useNavigate();

    // Estados para guardar o que o utilizador escreve
    const [rooms, setRooms] = useState([]); // Lista de salas para o dropdown
    const [formData, setFormData] = useState({
        room_id: "",
        date: "",
        start_time: "",
        end_time: "",
        purpose: ""
    });

    useEffect(() => {
        fetch("http://localhost/roomly_api/get_rooms.php")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((err) => console.error("Erro ao buscar salas:", err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ir buscar o ID do utilizador logado 
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Erro: Não estás logado!");
            return;
        }

        // 2. Preparar o pacote de dados para enviar
        const dadosParaEnviar = {
            ...formData,       // Junta os dados do formulário (sala, data, horas...)
            user_id: user.id   // Adiciona o ID de quem está a reservar
        };

        try {
            // 3. Enviar para o PHP
            const resposta = await fetch("http://localhost/roomly_api/create_reservation.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosParaEnviar)
            });

            const resultado = await resposta.json();

            if (resultado.status === "sucesso") {
                alert("Reserva Confirmada com Sucesso! ✅");
                navigate('/dashboard'); // Manda de volta para casa
            } else {
                alert("Ocorreu um erro: " + resultado.mensagem);
            }

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Erro de ligação ao servidor.");
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 ml-64 flex justify-center items-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100">

                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Calendar className="text-blue-600" /> Nova Reserva
                        </h1>
                        <p className="text-gray-500 mt-2">Preenche os dados para garantires a tua sala.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={18} /> Qual é a Sala?
                            </label>
                            <select
                                name="room_id"
                                required
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                onChange={handleChange}
                            >
                                <option value="">-- Seleciona uma sala --</option>
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} (Cap: {room.capacity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={18} /> Para quando?
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock size={18} /> Início
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock size={18} /> Fim
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <AlignLeft size={18} /> Motivo da Reserva
                            </label>
                            <textarea
                                name="purpose"
                                rows="3"
                                placeholder="Ex: Aula de Reforço de Matemática..."
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Confirmar Reserva
                        </button>

                    </form>
                </div>
            </main>
        </div>
    );
}