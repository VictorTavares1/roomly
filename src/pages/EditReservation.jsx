import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, MapPin, FileText, Save } from "lucide-react";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import { roomService, reservationService } from "../services/api";

export default function EditReservation() {
    const navigate = useNavigate();
    const location = useLocation();
    const reservaAtual = location.state?.reservation;

    if (!reservaAtual) {
        navigate('/my-reservations');
        return null;
    }

    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        id: reservaAtual.id,
        rooms_id: reservaAtual.rooms_id || "",
        start_time: reservaAtual.start_time.replace(' ', 'T'),
        end_time: reservaAtual.end_time.replace(' ', 'T'),
        purpose: reservaAtual.purpose
    });

    useEffect(() => {
        roomService.getAll()
            .then(data => setRooms(data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (name, value) => setFormData({ ...formData, [name]: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await reservationService.update(formData);

            if (res.status === "sucesso") {
                alert("Reserva alterada com sucesso! 📅");
                navigate('/my-reservations');
            } else {
                alert("Erro: " + res.mensagem);
            }
        } catch (error) { console.error("Erro:", error); }
    };

    return (
        <Layout title="Editar Reserva">
            <div className="flex justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Select
                            label="Sala" icon={MapPin} options={rooms}
                            value={formData.rooms_id} onChange={(val) => handleChange("rooms_id", val)} required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Início" type="datetime-local" icon={Clock} value={formData.start_time} onChange={(val) => handleChange("start_time", val)} required />
                            <Input label="Fim" type="datetime-local" icon={Clock} value={formData.end_time} onChange={(val) => handleChange("end_time", val)} required />
                        </div>
                        <Input label="Motivo" icon={FileText} value={formData.purpose} onChange={(val) => handleChange("purpose", val)} required />

                        <Button type="submit" variant="primary" className="w-full pt-4">
                            <Save size={20} /> Guardar Alterações
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}