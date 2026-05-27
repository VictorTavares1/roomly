import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles, MessageCircle } from "lucide-react";
import { reservationService } from "../services/api";
import toast from "react-hot-toast";

const API_BASE = "http://127.0.0.1/Roomly/roomly_api";

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
        { role: "assistant", text: "Olá! Sou o teu assistente de reservas 👋\n\nPodes dizer-me coisas como:\n• \"Reserva a Sala 1 amanhã das 10h às 11h para reunião\"\n• \"Que salas estão disponíveis de manhã?\"\n• \"Existe alguma sala com projetor disponível?\"" }
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
            {/* ── JANELA FLUTUANTE ── */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[340px] flex flex-col gap-1"
                    style={{ animation: "chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>

                    {/* Header pill */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 mb-1">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #1e66ff, #6366f1)" }}>
                                    <Sparkles size={14} className="text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800 dark:text-slate-100 leading-none">Assistente Roomly</p>
                                <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Online · IA</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Mensagens — flutuam sem moldura */}
                    <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto px-1 py-1 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                style={{ animation: "chatSlideUp 0.2s ease both" }}>

                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5 ${
                                    msg.role === "assistant"
                                        ? "shadow-sm"
                                        : "bg-gray-200 dark:bg-slate-600"
                                }`}
                                style={msg.role === "assistant" ? { background: "linear-gradient(135deg, #1e66ff, #6366f1)" } : {}}>
                                    {msg.role === "assistant"
                                        ? <Bot size={13} className="text-white" />
                                        : <User size={13} className="text-gray-600 dark:text-slate-300" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[82%] leading-relaxed whitespace-pre-line shadow-sm ${
                                    msg.role === "assistant"
                                        ? "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-sm border border-gray-100 dark:border-slate-700"
                                        : "text-white rounded-br-sm"
                                }`}
                                style={msg.role === "user" ? { background: "linear-gradient(135deg, #1e66ff, #6366f1)" } : {}}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex items-end gap-2">
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                    style={{ background: "linear-gradient(135deg, #1e66ff, #6366f1)" }}>
                                    <Bot size={13} className="text-white" />
                                </div>
                                <div className="px-3.5 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-1">
                                    {[0, 0.2, 0.4].map((delay, i) => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-400"
                                            style={{ animation: `typingDot 1.2s ease-in-out ${delay}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input pill */}
                    <div className="flex items-center gap-2 mt-1 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escreve uma mensagem..."
                            className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
                            style={{ background: "linear-gradient(135deg, #1e66ff, #6366f1)" }}
                        >
                            <Send size={13} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── BOTÃO FLUTUANTE ── */}
            <button
                onClick={() => setOpen(v => !v)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-4 pr-5 h-12 rounded-full text-white text-sm font-semibold shadow-xl transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
                style={{ background: "linear-gradient(135deg, #1e66ff, #6366f1)",
                    boxShadow: "0 8px 28px rgba(30,102,255,0.40)" }}
            >
                {open
                    ? <X size={17} />
                    : <><Sparkles size={15} /> Assistente</>
                }
            </button>
        </>
    );
}
