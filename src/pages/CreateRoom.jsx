import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Type, Users, Projector, Save } from "lucide-react";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { roomService } from "../services/api";

export default function CreateRoom() {
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [hasProjector, setHasProjector] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await roomService.create({
                name,
                capacity,
                has_projector: hasProjector ? 1 : 0
            });

            if (res.status === "sucesso") {
                alert("Sala criada com sucesso! 🏢");
                navigate('/rooms');
            } else {
                alert("Erro: " + res.mensagem);
            }
        } catch (error) { console.error("Erro:", error); }
    };

    return (
        <Layout title="Adicionar Nova Sala">
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Nome da Sala" placeholder="Ex: Laboratório de Química" value={name} onChange={setName} icon={Type} required />
                        <Input label="Lotação Máxima" type="number" placeholder="Ex: 30" value={capacity} onChange={setCapacity} icon={Users} required />

                        <div className="flex items-center gap-3 p-4 border rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setHasProjector(!hasProjector)}>
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${hasProjector ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                {hasProjector && <Projector size={14} className="text-white" />}
                            </div>
                            <span className="font-medium text-slate-700 select-none">Tem Projetor Disponível?</span>
                        </div>

                        <Button type="submit" variant="success" className="w-full py-4 text-lg">
                            <Save size={20} /> Criar Sala
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}