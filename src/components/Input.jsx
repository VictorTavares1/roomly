export default function Input({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    icon: Icon, // Renomeamos para Icon (letra maiúscula) para usar como componente
    required = false,
    className = ""
}) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                    </div>
                )}

                <input
                    type={type}
                    className={`block w-full py-3.5 border border-gray-200 dark:border-white/[0.1] rounded-xl leading-5 bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 dark:focus:border-blue-500/60 transition-all font-medium text-slate-700 dark:text-slate-100 shadow-sm dark:shadow-black/10 ${Icon ? 'pl-10' : 'pl-4'} pr-4`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                />
            </div>
        </div>
    );
}