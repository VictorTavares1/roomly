import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Users, CalendarPlus, Building2, GraduationCap,
    Monitor, UsersRound, Info, Clock, CheckCircle2, Wrench
} from "lucide-react";
import Layout from "../components/Layout";

const WEEKLY_MAX = 50;

function inferType(room) {
    if (room.type) return room.type.toUpperCase();
    const name = (room.name || "").toLowerCase();
    if (name.includes("audit")) return "AUDITÓRIO";
    if (name.includes("reuni") || name.includes("conferên") || name.includes("conferen"))
        return "REUNIÃO";
    if (
        name.includes("lab") || name.includes("ciência") || name.includes("cienc") ||
        name.includes("quím") || name.includes("quim") || name.includes("inform") ||
        name.includes("física") || name.includes("fisica")
    )
        return "LABORATÓRIO";
    return "AULA";
}

function getStatus(room) {
    if (!room.status) return "DISPONÍVEL";
    const s = room.status.toLowerCase();
    if (s.includes("ocup")) return "OCUPADA";
    if (s.includes("manu")) return "EM MANUTENÇÃO";
    return "DISPONÍVEL";
}

const typeConfig = {
    AUDITÓRIO:   { icon: Building2,     bg: "bg-indigo-800",  iconColor: "text-indigo-200" },
    REUNIÃO:     { icon: UsersRound,    bg: "bg-blue-700",    iconColor: "text-blue-100" },
    LABORATÓRIO: { icon: Monitor,       bg: "bg-cyan-800",    iconColor: "text-cyan-100" },
    AULA:        { icon: GraduationCap, bg: "bg-emerald-700", iconColor: "text-emerald-100" },
};

const statusConfig = {
    "DISPONÍVEL":    { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",   icon: CheckCircle2, dot: "bg-green-500" },
    "OCUPADA":       { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Clock,        dot: "bg-orange-500" },
    "EM MANUTENÇÃO": { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",            icon: Wrench,       dot: "bg-red-500" },
};

export default function RoomDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const room = location.state?.room;

    // Se não há dados (acesso directo à URL), redireciona para a lista
    if (!room) {
        navigate("/rooms");
        return null;
    }

    const type = inferType(room);
    const status = getStatus(room);
    const { icon: TypeIcon, bg, iconColor } = typeConfig[type] || typeConfig["AULA"];
    const { badge, dot } = statusConfig[status] || statusConfig["DISPONÍVEL"];
    const canReserve = status === "DISPONÍVEL";

    const typeLabel = {
        AUDITÓRIO: "Auditório", REUNIÃO: "Sala de Reunião",
        LABORATÓRIO: "Laboratório", AULA: "Sala de Aula",
    }[type] || type;

    return (
        <Layout>
            {/* Back button */}
            <button
                onClick={() => navigate("/rooms")}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Voltar às Salas
            </button>

            <div className="max-w-2xl mx-auto">
                {/* Header card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-7 mb-5">
                    <div className="flex items-start gap-5">
                        <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-md`}>
                            <TypeIcon size={30} className={iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                                    {room.name}
                                </h1>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${badge} flex items-center gap-1.5 shrink-0`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                                    {status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{typeLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Capacidade */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={15} className="text-blue-500" />
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Capacidade</p>
                        </div>
                        <p className="text-2xl font-black text-gray-800 dark:text-slate-100">
                            {room.capacity ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">pessoas</p>
                    </div>

                    {/* Tipo */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={15} className="text-violet-500" />
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Tipo</p>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-slate-100">{typeLabel}</p>
                    </div>
                </div>

                {/* Descrição */}
                {room.description && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 mb-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Descrição</p>
                        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{room.description}</p>
                    </div>
                )}

                {/* Ocupação semanal */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={15} className="text-emerald-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Ocupação Semanal</p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-slate-400">Esta semana</p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">— / {WEEKLY_MAX}h</p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full" />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                        Máximo recomendado: {WEEKLY_MAX}h por semana
                    </p>
                </div>

                {/* CTA */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/rooms")}
                        className="flex-1 py-3 text-sm font-medium border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Voltar à Lista
                    </button>
                    <button
                        disabled={!canReserve}
                        onClick={() => canReserve && navigate("/new-reservation", { state: { room } })}
                        className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                            canReserve
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        <CalendarPlus size={16} />
                        {canReserve ? "Reservar esta Sala" : "Indisponível para Reserva"}
                    </button>
                </div>
            </div>
        </Layout>
    );
}
