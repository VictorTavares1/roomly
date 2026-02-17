export default function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Selecione uma opção",
    required = false,
    icon: Icon
}) {
    return (
        <div>
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
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className={`block w-full py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-800 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-200 shadow-sm appearance-none ${Icon ? 'pl-10' : 'pl-4'} pr-10 cursor-pointer`}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 dark:text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </div>
        </div>
    );
}