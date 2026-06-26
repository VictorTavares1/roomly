import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    return (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-slate-700">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={14} /> Anterior
            </button>

            <div className="flex items-center gap-1">
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400 dark:text-slate-500">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                p === page
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Próxima <ChevronRight size={14} />
            </button>
        </div>
    );
}
