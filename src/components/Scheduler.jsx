import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// CORREÇÃO: Importar tudo da raiz (nova versão do date-fns)
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pt } from "date-fns/locale"; // 'pt' é o Português de Portugal
import "react-big-calendar/lib/css/react-big-calendar.css";
import { reservationService } from "../services/api";

// Configurar a localização
const locales = {
    "pt-PT": pt,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function Scheduler({ roomId, date }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await reservationService.getCalendarEvents();

                const formattedEvents = data.map((event) => ({
                    title: `${event.room_name} (${event.user_name})`,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    resource: event,
                    rooms_id: event.rooms_id ?? event.room_id,
                }));

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Erro ao carregar calendário:", error);
            }
        }
        fetchEvents();
    }, []);

    // Filtra por sala e/ou data quando fornecidos
    const filteredEvents = events.filter((ev) => {
        const matchRoom = !roomId || String(ev.resource?.rooms_id ?? ev.resource?.room_id) === String(roomId);
        if (!matchRoom) return false;
        if (!date) return true;
        const evDate = ev.start.toISOString().slice(0, 10);
        return evDate === date;
    });

    const defaultDate = date ? new Date(date) : new Date();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[600px]">
            {roomId && date && (
                <p className="text-sm text-gray-500 mb-3">
                    Ocupações da sala selecionada em <strong>{new Date(date + "T12:00:00").toLocaleDateString("pt-PT")}</strong>
                </p>
            )}
            <Calendar
                localizer={localizer}
                events={filteredEvents}
                date={defaultDate}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                culture="pt-PT"
                messages={{
                    next: "Seguinte",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    agenda: "Agenda",
                    date: "Data",
                    time: "Hora",
                    event: "Reserva",
                    noEventsInRange: "Sem reservas neste período."
                }}
            />
        </div>
    );
}