import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, AlignLeft, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar"; // Usar Sidebar diretamente para ter flexibilidade
import Input from "../components/Input";
import Button from "../components/Button";
import Scheduler from "../components/Scheduler"; // <--- O NOSSO CALENDÁRIO NOVO
import { roomService, reservationService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NewReservation() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Dados do Formulário
    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Carregar as Salas ao iniciar
    useEffect(() => {
        async function fetchRooms() {
            try {
                const data = await roomService.getAll();
                setRooms(data);
                if (data.length > 0) setRoomId(data[0].id); // Seleciona a primeira por defeito
            } catch (err) {
                console.error("Erro ao carregar salas", err);
            }
        }
        fetchRooms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validar lógica simples
        if (startTime >= endTime) {
            setError("A hora de fim tem de ser depois do início.");
            setLoading(false);
            return;
        }

        try {
            // Montar as datas completas (Data + Hora)
            const startFull = `${date} ${startTime}:00`;
            const endFull = `${date} ${endTime}:00`;

            // ATENÇÃO: Usei 'rooms_id' porque foi o que vi no teu print da base de dados!
            await reservationService.create({
                user_id: user.id,
                rooms_id: roomId, // <--- CONFIRMADO PELO PRINT DA DB
                start_time: startFull,
                end_time: endFull,
                purpose
            });

            alert("Reserva criada com sucesso! 🎉");
            navigate("/my-reservations");
        } catch (err) {
            console.error(err);
            setError("Erro ao criar reserva. Verifica se a sala já não está ocupada nesse horário.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Nova Reserva 📅</h1>

                <div className="flex flex-col xl:flex-row gap-8">

                    {/* COLUNA DA ESQUERDA: O Formulário */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full xl:w-1/3 h-fit">
                        <h2 className="text-xl font-bold text-gray-700 mb-6">Detalhes</h2>

                        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Escolher Sala</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <select
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} (Cap: {room.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Input label="Data" type="date" value={date} onChange={setDate} icon={Calendar} required />

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Início" type="time" value={startTime} onChange={setStartTime} icon={Clock} required />
                                <Input label="Fim" type="time" value={endTime} onChange={setEndTime} icon={Clock} required />
                            </div>

                            <Input label="Motivo" type="text" placeholder="Ex: Aula de Apoio" value={purpose} onChange={setPurpose} icon={AlignLeft} required />

                            <Button type="submit" variant="primary" className="w-full mt-4 py-3" isLoading={loading}>
                                <CheckCircle size={20} /> Confirmar Reserva
                            </Button>
                        </form>
                    </div>

                    {/* COLUNA DA DIREITA: O CALENDÁRIO PRO */}
                    <div className="w-full xl:w-2/3">
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            {/* Aqui entra o componente que criámos com o react-big-calendar */}
                            <Scheduler />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}