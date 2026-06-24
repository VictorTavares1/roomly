import { useNavigate } from "react-router-dom";
import {
    Users, Monitor, GraduationCap, Building2,
    UsersRound, CalendarPlus, Info
} from "lucide-react";

const WEEKLY_MAX = 50;

function inferType(room) {
    return room.type ? room.type.toUpperCase() : "AULA";
}

const typeConfig = {
    AUDITÓRIO: {
        icon: Building2,
        bg: "bg-indigo-800",
        iconColor: "text-indigo-200",
    },
    REUNIÃO: { icon: UsersRound, bg: "bg-blue-700", iconColor: "text-blue-100" },
    LABORATÓRIO: {
        icon: Monitor,
        bg: "bg-cyan-800",
        iconColor: "text-cyan-100",
    },
    AULA: {
        icon: GraduationCap,
        bg: "bg-emerald-700",
        iconColor: "text-emerald-100",
    },
};

const statusConfig = {
    DISPONÍVEL: {
        badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    OCUPADA: {
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    "EM MANUTENÇÃO": {
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
};

function getStatus(room) {
    if (!room.status) return "DISPONÍVEL";
    const s = room.status.toLowerCase();
    if (s === "em_curso") return "EM_CURSO";
    if (s.includes("ocup")) return "OCUPADA";
    if (s.includes("manu")) return "EM MANUTENÇÃO";
    return "DISPONÍVEL";
}

export default function RoomCard({
    room,
    weeklyHours,
    onViewDetails,
    availabilityDate,
    availabilityStart,
    availabilityEnd,
}) {
    const navigate = useNavigate();
    const type = inferType(room);
    const { icon: Icon, bg, iconColor } =
        typeConfig[type] || typeConfig["AULA"];
    const status = getStatus(room);
    const displayStatus = status === "EM_CURSO" ? "DISPONÍVEL" : status;
    const { badge } = statusConfig[displayStatus] || statusConfig["DISPONÍVEL"];

    const hours =
        weeklyHours != null ? Math.round(weeklyHours * 10) / 10 : null;
    const progressPct =
        hours != null ? Math.min((hours / WEEKLY_MAX) * 100, 100) : null;
    const isHighOccupancy = progressPct != null && progressPct > 70;

    return (
        <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md dark:hover:shadow-black/30 transition-all flex flex-col gap-4">

            {/* Top row: icon + status badge */}
            <div className="flex items-start justify-between">
                <div
                    className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                >
                    <Icon size={19} className={iconColor} />
                </div>
                <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${badge}`}
                >
                    {displayStatus}
                </span>
            </div>

            {/* Room name + capacity + type */}
            <div>
                <h3 className="text-[17px] font-bold text-gray-800 dark:text-slate-100 leading-snug">
                    {room.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                        <Users size={13} className="text-gray-400 dark:text-slate-500" />
                        {room.capacity} pessoas
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded tracking-wide">
                        {type}
                    </span>
                </div>
            </div>

            {/* Weekly occupation bar */}
            {hours != null ? (
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                            Ocupação semanal
                        </span>
                        <span
                            className={`text-xs font-semibold ${isHighOccupancy ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`}
                        >
                            {hours}h / {WEEKLY_MAX}h
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isHighOccupancy ? "bg-orange-500" : "bg-blue-500"}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                            Ocupação semanal
                        </span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            --h / {WEEKLY_MAX}h
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full" />
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-1">
                <button
                    onClick={() => onViewDetails ? onViewDetails(room) : null}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <Info size={14} />
                    Detalhes
                </button>
                <button
                    onClick={() =>
                        displayStatus === "DISPONÍVEL" &&
                        navigate("/new-reservation", {
                            state: {
                                room,
                                date: availabilityDate || "",
                                startTime: availabilityStart || "",
                                endTime: availabilityEnd || "",
                            },
                        })
                    }
                    disabled={displayStatus !== "DISPONÍVEL"}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        displayStatus !== "DISPONÍVEL"
                            ? "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                    <CalendarPlus size={14} />
                    {displayStatus === "EM MANUTENÇÃO" ? "Em Manutenção" : displayStatus === "OCUPADA" ? "Ocupada" : "Reservar"}
                </button>
            </div>

        </div>
    );
}
