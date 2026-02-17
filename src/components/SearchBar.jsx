import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Pesquisar..." }) {
    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>

            <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all sm:text-sm shadow-sm text-slate-700 dark:text-slate-200"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}