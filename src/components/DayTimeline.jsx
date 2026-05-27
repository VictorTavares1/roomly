import { useEffect, useState } from "react";
import { Clock, CalendarX } from "lucide-react";
import { reservationService } from "../services/api";

const HOUR_START = 8;
const HOUR_END = 20;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

function pct(minutes) {
    const start = HOUR_START * 60;
    const total = TOTAL_HOURS * 60;
    return Math.min(Math.max(((minutes - start) / total) * 100, 0), 100);
}

export default function DayTimeline({ roomId, date, startTime, endTime, onConflict }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!roomId || !date) { setReservations([]); return; }
        setLoading(true);
        reservationService.getByRoom(roomId)
            .then(data => {
                const dayRes = (data || []).filter(r => {
                    if (r.status === "cancelada") return false;
                    return r.start_time?.slice(0, 10) === date;
                });
                setReservations(dayRes);
            })
            .catch(() => setReservations([]))
            .finally(() => setLoading(false));
    }, [roomId, date]);

    // Notifica o pai sempre que o estado de conflito muda
    useEffect(() => {
        if (!onConflict) return;
        if (!startTime || !endTime || !roomId || !date) { onConflict(false); return; }
        const previewS = toMinutes(startTime);
        const previewE = toMinutes(endTime);
        if (previewE <= previewS) { onConflict(false); return; }
        const hasConflict = reservations.some(r => {
            const s = toMinutes(r.start_time.slice(11, 16));
            const e = toMinutes(r.end_time.slice(11, 16));
            return previewS < e && previewE > s;
        });
        onConflict(hasConflict, reservations);
    }, [reservations, startTime, endTime, roomId, date]);

    const hourLabels = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

    // Bloco da nova reserva (preview)
    const previewStart = startTime ? toMinutes(startTime) : null;
    const previewEnd   = endTime   ? toMinutes(endTime)   : null;
    const previewValid = previewStart !== null && previewEnd !== null && previewEnd > previewStart;

    if (!roomId || !date) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-300 dark:text-slate-600">
                <CalendarX size={36} strokeWidth={1.5} />
                <p className="text-sm font-medium">Seleciona uma sala e uma data<br />para ver a disponibilidade</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock size={15} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Ocupação — {new Date(date + "T12:00:00").toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                </div>
                {loading && (
                    <span className="text-xs text-gray-400 dark:text-slate-500 animate-pulse">A carregar...</span>
                )}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-red-400/80 inline-block" /> Ocupado
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> A tua reserva
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-400/60 inline-block" /> Disponível
                </span>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Régua de horas */}
                <div className="flex justify-between mb-1.5 px-0">
                    {hourLabels.map(h => (
                        <span key={h} className="text-[10px] text-gray-300 dark:text-slate-600 font-medium" style={{ width: 0, textAlign: "center" }}>
                            {h}h
                        </span>
                    ))}
                </div>

                {/* Barra principal */}
                <div className="relative h-12 rounded-xl overflow-hidden bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">

                    {/* Linhas de hora */}
                    {hourLabels.map((h, i) => (
                        i > 0 && i < hourLabels.length - 1 && (
                            <div key={h} className="absolute top-0 h-full w-px bg-gray-100 dark:bg-slate-700/50"
                                style={{ left: `${((h - HOUR_START) / TOTAL_HOURS) * 100}%` }} />
                        )
                    ))}

                    {/* Blocos ocupados */}
                    {reservations.map(r => {
                        const s = toMinutes(r.start_time.slice(11, 16));
                        const e = toMinutes(r.end_time.slice(11, 16));
                        const left = pct(s);
                        const width = pct(e) - left;
                        if (width <= 0) return null;
                        return (
                            <div
                                key={r.id}
                                className="absolute top-1 bottom-1 rounded-lg bg-red-400/80 dark:bg-red-500/70 flex items-center justify-center overflow-hidden group"
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={`${r.start_time.slice(11,16)} – ${r.end_time.slice(11,16)} · ${r.purpose || "Reservado"}`}
                            >
                                <span className="text-[10px] text-white font-semibold px-1 truncate hidden group-hover:block">
                                    {r.start_time.slice(11,16)}–{r.end_time.slice(11,16)}
                                </span>
                            </div>
                        );
                    })}

                    {/* Preview da nova reserva */}
                    {previewValid && (() => {
                        const left = pct(previewStart);
                        const width = pct(previewEnd) - left;
                        return width > 0 ? (
                            <div
                                className="absolute top-1 bottom-1 rounded-lg bg-blue-500 flex items-center justify-center overflow-hidden border-2 border-blue-300 dark:border-blue-400"
                                style={{ left: `${left}%`, width: `${width}%` }}
                            >
                                <span className="text-[10px] text-white font-bold px-1 truncate">
                                    {startTime}–{endTime}
                                </span>
                            </div>
                        ) : null;
                    })()}

                    {/* Indicador "agora" */}
                    {(() => {
                        const now = new Date();
                        const todayStr = now.toISOString().slice(0, 10);
                        if (date !== todayStr) return null;
                        const nowMin = now.getHours() * 60 + now.getMinutes();
                        if (nowMin < HOUR_START * 60 || nowMin > HOUR_END * 60) return null;
                        return (
                            <div className="absolute top-0 h-full w-0.5 bg-amber-400 z-10"
                                style={{ left: `${pct(nowMin)}%` }}>
                                <div className="w-2 h-2 rounded-full bg-amber-400 -translate-x-[3px] -translate-y-[1px]" />
                            </div>
                        );
                    })()}
                </div>

                {/* Rótulos de horas em baixo */}
                <div className="relative mt-1 h-3">
                    {hourLabels.map((h, i) => (
                        <span
                            key={h}
                            className="absolute text-[9px] text-gray-300 dark:text-slate-600 -translate-x-1/2"
                            style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                        >
                            {String(h).padStart(2, "0")}:00
                        </span>
                    ))}
                </div>
            </div>

            {/* Lista de ocupações do dia */}
            {reservations.length === 0 && !loading ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center py-2">
                    Sem reservas neste dia — sala completamente livre
                </p>
            ) : (
                <div className="flex flex-col gap-1.5 mt-1">
                    {reservations.map(r => (
                        <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 tabular-nums">
                                {r.start_time.slice(11, 16)} – {r.end_time.slice(11, 16)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-slate-500 truncate">
                                {r.purpose || "Reservado"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
