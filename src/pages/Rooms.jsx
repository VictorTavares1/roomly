import { useEffect, useState } from "react";
import { Trash2, Pencil, Projector, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import RoomCard from "../components/RoomCard";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import { roomService } from "../services/api";
import { useAuth } from "../context/AuthContext"; // <--- IMPORTAR CONTEXTO
import { translateMessage } from "../utils/translations";

export default function Rooms() {
    const { user } = useAuth(); // <--- JÁ TEMOS O USER AQUI (SEM localStorage)
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProjector, setFilterProjector] = useState(false);

    useEffect(() => {
        roomService.getAll()
            .then((data) => setRooms(data))
            .catch((erro) => console.error(erro));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Tens a certeza que queres remover esta sala?")) return;

        try {
            const res = await roomService.delete(id);
            if (res.status === "sucesso") {
                setRooms((prev) => prev.filter((sala) => sala.id !== id));
            } else {
                alert("Erro: " + translateMessage(res.mensagem));
            }
        } catch (erro) {
            console.error("Erro:", erro);
        }
    };

    const filteredRooms = rooms.filter((sala) => {
        const matchesSearch = sala.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProjector = filterProjector ? sala.has_projector == 1 : true;
        return matchesSearch && matchesProjector;
    });

    return (
        <Layout title="Salas de Aula">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex-1 w-full">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar sala por nome..." />
                </div>
                <Button variant={filterProjector ? "primary" : "outline"} onClick={() => setFilterProjector(!filterProjector)}>
                    <Projector size={18} />
                    {filterProjector ? "Com Projetor (Ativo)" : "Filtrar por Projetor"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {filteredRooms.map((sala) => (
                    <div key={sala.id} className="relative group w-full max-w-sm animate-fade-in">
                        <RoomCard room={sala} />
                        {/* Verifica se é admin usando o user do Contexto */}
                        {user?.role === 'admin' && (
                            <div className="absolute -top-2 -right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="warning" onClick={() => navigate('/edit-room', { state: { room: sala } })} className="!p-2 !rounded-full !w-10 !h-10">
                                    <Pencil size={16} />
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(sala.id)} className="!p-2 !rounded-full !w-10 !h-10">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {filteredRooms.length === 0 && (
                <div className="text-center py-12 text-gray-400">Nenhuma sala encontrada.</div>
            )}
        </Layout>
    );
}