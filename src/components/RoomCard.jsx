import { Users, Projector, Check } from "lucide-react";

export default function RoomCard({ room }) {


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100">
            <div className="h-32 bg-blue-600 flex items-center justify-center">

                <h3 className="text-white text-3xl font-bold opacity-50">{room.name.charAt(0)}</h3>
            </div>

            <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{room.name}</h2>

                <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span>Capacidade: <b>{room.capacity} pessoas</b></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Projector size={16} className={room.has_projector ? "text-green-500" : "text-gray-400"} />
                        <span>{room.has_projector ? "Tem Projetor" : "Sem Projetor"}</span>
                    </div>
                </div>

                <button className="btn w-full mt-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                    Ver Detalhes
                </button>
            </div>
        </div>
    )
}