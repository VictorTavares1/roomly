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

export default function Scheduler() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await reservationService.getCalendarEvents();

                // Converter strings para objetos Date
                const formattedEvents = data.map(event => ({
                    title: `${event.room_name} (${event.user_name})`,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    resource: event
                }));

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Erro ao carregar calendário:", error);
            }
        }
        fetchEvents();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
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