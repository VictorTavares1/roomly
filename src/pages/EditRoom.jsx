import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Type, Users, Projector, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Input from "../components/Input";
import Button from "../components/Button";
import { roomService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { translateMessage } from "../utils/translations";

export default function EditRoom() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const room = location.state?.room;

    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [hasProjector, setHasProjector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!room) {
            navigate("/rooms", { replace: true });
            return;
        }
        if (user?.role !== "admin") {
            navigate("/rooms", { replace: true });
            return;
        }
        setName(room.name || "");
        setCapacity(String(room.capacity || ""));
        setHasProjector(room.has_projector == 1);
    }, [room, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await roomService.update({
                id: room.id,
                name,
                capacity: parseInt(capacity, 10),
                has_projector: hasProjector ? 1 : 0
            });

            if (res.status === "sucesso") {
                toast.success("Sala atualizada com sucesso! 🏢");
                navigate("/rooms");
            } else {
                setError(translateMessage(res.mensagem) || "Erro ao atualizar sala.");
            }
        } catch (err) {
            console.error("Erro:", err);
            setError("Erro ao atualizar sala. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!room) return null;

    return (
        <Layout>
            <div className="mb-6">
                <button
                    onClick={() => navigate("/rooms")}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    <ArrowLeft size={18} /> Voltar às Salas
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200 mb-8">Editar Sala ✏️</h1>

            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 w-full max-w-lg transition-colors">
                    {error && (
                        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Nome da Sala" placeholder="Ex: Laboratório de Química" value={name} onChange={setName} icon={Type} required />
                        <Input label="Lotação Máxima" type="number" placeholder="Ex: 30" value={capacity} onChange={setCapacity} icon={Users} required />

                        <div className="flex items-center gap-3 p-4 border dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" onClick={() => setHasProjector(!hasProjector)}>
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${hasProjector ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                                {hasProjector && <Projector size={14} className="text-white" />}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 select-none">Tem Projetor Disponível?</span>
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => navigate("/rooms")} className="flex-1">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1 py-4" isLoading={loading}>
                                <Save size={20} /> Guardar Alterações
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
