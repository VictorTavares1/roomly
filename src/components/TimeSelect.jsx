import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, h) =>
    Array.from({ length: 2 }, (_, q) => {
        const m = q * 30;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    })
).flat();

function isValidTime(val) {
    return /^\d{2}:\d{2}$/.test(val) && (() => {
        const [h, m] = val.split(":").map(Number);
        return h >= 0 && h <= 23 && m >= 0 && m <= 59;
    })();
}

export default function TimeSelect({ value, onChange, label, required, min, className = "", inputRef }) {
    const [input, setInput] = useState(value || "");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Sincroniza quando o valor externo muda (ex: sugestão de slot)
    useEffect(() => {
        setInput(value || "");
    }, [value]);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filtered = HOURS.filter(t => {
        if (min && t < min) return false;
        if (!input) return true;
        return t.startsWith(input.replace("_", ""));
    });

    function handleInputChange(e) {
        let val = e.target.value;
        // Aceita dígitos e ":"
        val = val.replace(/[^\d:]/g, "");
        // Auto-insere ":" depois de 2 dígitos
        if (val.length === 2 && !val.includes(":")) val = val + ":";
        if (val.length > 5) val = val.slice(0, 5);
        setInput(val);
        setOpen(true);
        if (isValidTime(val)) {
            onChange(val);
        } else if (val === "") {
            onChange("");
        }
    }

    function handleSelect(t) {
        setInput(t);
        onChange(t);
        setOpen(false);
    }

    function handleBlur() {
        // Se o valor escrito for válido confirma, caso contrário reverte para o último valor válido
        setTimeout(() => {
            if (!isValidTime(input)) {
                setInput(value || "");
            }
            setOpen(false);
        }, 150);
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    onBlur={handleBlur}
                    placeholder="HH:MM"
                    maxLength={5}
                    required={required}
                    className="block w-28 pl-8 pr-3 py-2 border border-gray-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-100 shadow-sm"
                />
            </div>

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(t => (
                        <li
                            key={t}
                            onMouseDown={() => handleSelect(t)}
                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors
                                ${t === value
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                }`}
                        >
                            {t}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
