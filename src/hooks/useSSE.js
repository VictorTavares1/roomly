import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1/Roomly/roomly_api/api";

/**
 * Hook que abre uma ligação SSE e chama onUpdate(changedEntities[])
 * sempre que o servidor detetar mudanças.
 *
 * @param {string[]} watch - entidades a observar: ['reservations','rooms','reports']
 * @param {function} onUpdate - callback chamado quando há mudanças
 */
export function useSSE(watch, onUpdate) {
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    useEffect(() => {
        const token = localStorage.getItem("roomly_token");
        if (!token) return;

        let es;
        let reconnectTimer;

        function connect() {
            es = new EventSource(`${API_BASE}/events.php?token=${encodeURIComponent(token)}`);

            es.addEventListener("update", (e) => {
                try {
                    const data = JSON.parse(e.data);
                    const changed = data.changed || [];
                    // Só notifica se alguma das entidades que interessam mudou
                    if (watch.some(w => changed.includes(w))) {
                        onUpdateRef.current(changed);
                    }
                } catch (_) {}
            });

            es.addEventListener("error", () => {
                es.close();
                // Reconnectar após 5s se a ligação cair
                reconnectTimer = setTimeout(connect, 5000);
            });
        }

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (es) es.close();
        };
    }, []);
}
