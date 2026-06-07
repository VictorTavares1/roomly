import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, MessageSquare } from "lucide-react";
import { reservationService } from "../services/api";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1/Roomly/roomly_api";

function getToken() {
    return localStorage.getItem("roomly_token");
}

async function sendMessage(message, history) {
    const res = await fetch(`${API_BASE}/api/assistant/chat.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ message, history })
    });
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Resposta inválida do servidor.");
    }
}

export default function AssistantChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Olá! Sou o teu assistente de reservas.\n\nPodes dizer-me coisas como:\n• \"Reserva a Sala 1 amanhã das 10h às 11h para reunião\"\n• \"Que salas estão disponíveis de manhã?\"\n• \"Existe alguma sala com projetor disponível?\"" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const addMessage = (role, text) => {
        setMessages(prev => [...prev, { role, text }]);
    };

    const executeAction = async (action) => {
        if (action.action === "create_reservation") {
            await reservationService.create({
                rooms_id: action.room_id,
                start_time: `${action.date} ${action.start_time}:00`,
                end_time: `${action.date} ${action.end_time}:00`,
                purpose: action.purpose
            });
            toast.success("Reserva criada pelo assistente!");
            return `✅ Reserva criada com sucesso!\n📅 ${action.date} das ${action.start_time} às ${action.end_time}\n📝 Motivo: ${action.purpose}`;
        }
        return null;
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput("");
        const newMessages = [...messages, { role: "user", text }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const history = newMessages.slice(1, -1);
            const data = await sendMessage(text, history);

            if (data.type === "action") {
                try {
                    const msg = await executeAction(data.action);
                    if (msg) addMessage("assistant", msg);
                } catch (err) {
                    addMessage("assistant", `❌ Não consegui criar a reserva: ${err.message}`);
                }
            } else {
                addMessage("assistant", data.message);
            }
        } catch {
            addMessage("assistant", "Ocorreu um erro. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ── JANELA ── */}
            {open && (
                <div className="fixed bottom-20 right-4 lg:right-6 z-50 w-[calc(100vw-32px)] max-w-[340px] flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                                <Bot size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-none">Assistente</p>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Roomly IA</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Mensagens */}
                    <div className="flex flex-col gap-3 h-[340px] overflow-y-auto px-4 py-4 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                    msg.role === "assistant" ? "bg-blue-500" : "bg-gray-200 dark:bg-slate-600"
                                }`}>
                                    <Bot size={11} className={msg.role === "assistant" ? "text-white" : "text-gray-500 dark:text-slate-300"} />
                                </div>
                                <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] leading-relaxed whitespace-pre-line ${
                                    msg.role === "assistant"
                                        ? "bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-200"
                                        : "bg-blue-500 text-white"
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot size={11} className="text-white" />
                                </div>
                                <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center gap-1">
                                    {[0, 0.2, 0.4].map((delay, i) => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-400"
                                            style={{ animation: `typingDot 1.2s ease-in-out ${delay}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-slate-700">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escreve uma mensagem..."
                            className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            <Send size={13} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── BOTÃO FLUTUANTE ── */}
            <button
                onClick={() => setOpen(v => !v)}
                className="fixed bottom-6 right-4 lg:right-6 z-50 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-colors"
            >
                {open ? <X size={18} /> : <MessageSquare size={18} />}
            </button>
        </>
    );
}
