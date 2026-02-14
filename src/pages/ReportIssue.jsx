import { useState, useEffect } from "react";
import { AlertTriangle, Send, MapPin, MessageSquare } from "lucide-react";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { roomService, reportService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { translateMessage } from "../utils/translations";

export default function ReportIssue() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        roomService.getAll().then(setRooms);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await reportService.create({
                user_id: user.id,
                room_id: selectedRoom,
                description
            });

            if (res.status === "sucesso") {
                alert("Report enviado! A equipa técnica foi notificada. 🛠️");
                navigate("/my-reports");
            } else {
                alert(translateMessage(res.mensagem || "Erro ao enviar report."));
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    return (
        <Layout>
            <div className="max-w-xl mx-auto mt-10">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Reportar Avaria</h1>
                            <p className="text-gray-500 text-sm">Encontrou um problema na sala?</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qual é a sala?</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                <select
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione a sala...</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Problema</label>
                            <div className="relative">
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
                                    placeholder="Ex: O projetor não liga / A cadeira está partida..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" isLoading={loading}>
                            <Send size={18} /> Enviar Report
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}