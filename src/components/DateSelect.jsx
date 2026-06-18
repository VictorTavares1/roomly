import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

function isValidDate(val) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const d = new Date(val);
    return !isNaN(d.getTime());
}

function formatDisplay(val) {
    // Converte YYYY-MM-DD para DD/MM/YYYY para exibir
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split("-");
        return `${d}/${m}/${y}`;
    }
    return val;
}

function parseDisplay(val) {
    // Converte DD/MM/YYYY para YYYY-MM-DD para guardar
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
        const [d, m, y] = val.split("/");
        return `${y}-${m}-${d}`;
    }
    return val;
}

// Gera os próximos 365 dias como opções
function generateDays(min) {
    const days = [];
    const today = new Date();
    const minDate = min ? new Date(min) : today;
    for (let i = 0; i < 365; i++) {
        const d = new Date(minDate);
        d.setDate(minDate.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        const [y, m, day] = iso.split("-");
        days.push({ iso, display: `${day}/${m}/${y}` });
    }
    return days;
}

export default function DateSelect({ value, onChange, label, required, min, className = "" }) {
    const [input, setInput] = useState(value ? formatDisplay(value) : "");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const days = generateDays(min);

    useEffect(() => {
        setInput(value ? formatDisplay(value) : "");
    }, [value]);

    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filtered = days.filter(d => {
        if (!input) return true;
        return d.display.startsWith(input);
    });

    function handleInputChange(e) {
        let val = e.target.value;
        val = val.replace(/[^\d/]/g, "");
        if (val.length === 2 && !val.includes("/")) val = val + "/";
        if (val.length === 5 && val.split("/").length === 2) val = val + "/";
        if (val.length > 10) val = val.slice(0, 10);
        setInput(val);
        setOpen(true);
        const iso = parseDisplay(val);
        if (isValidDate(iso)) onChange(iso);
        else if (val === "") onChange("");
    }

    function handleSelect(day) {
        setInput(day.display);
        onChange(day.iso);
        setOpen(false);
    }

    function handleBlur() {
        setTimeout(() => {
            const iso = parseDisplay(input);
            if (!isValidDate(iso)) setInput(value ? formatDisplay(value) : "");
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
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    onBlur={handleBlur}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    required={required}
                    className="block w-36 pl-8 pr-3 py-2 border border-gray-200 dark:border-white/[0.1] rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-100 shadow-sm"
                />
            </div>

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(d => (
                        <li
                            key={d.iso}
                            onMouseDown={() => handleSelect(d)}
                            className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors
                                ${d.iso === value
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                }`}
                        >
                            {d.display}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
