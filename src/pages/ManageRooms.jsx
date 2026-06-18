import { useEffect, useState, useCallback } from "react";
import {
    Building2, Plus, Pencil, Trash2, Search,
    Users, Projector, X, Save, Type, Check
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { roomService } from "../services/api";
import { translateMessage } from "../utils/translations";

const TYPE_OPTIONS = ["AULA", "LABORATÓRIO", "REUNIÃO", "AUDITÓRIO"];

const typeConfig = {
    AUDITÓRIO:   { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400" },
    REUNIÃO:     { bg: "bg-blue-100 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-400" },
    LABORATÓRIO: { bg: "bg-cyan-100 dark:bg-cyan-900/30",    text: "text-cyan-700 dark:text-cyan-400" },
    AULA:        { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
};

const EMPTY_FORM = { name: "", capacity: "", type: "AULA", has_projector: false };

export default function ManageRooms() {
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("TODOS");

    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const loadRooms = useCallback(() => {
        roomService.getAll().then(data => setRooms(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        loadRooms();
        const interval = setInterval(loadRooms, 10000);
        return () => clearInterval(interval);
    }, [loadRooms]);

    const openCreate = () => {
        setEditingRoom(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (room) => {
        setEditingRoom(room);
        setForm({
            name: room.name,
            capacity: String(room.capacity),
            type: (room.type || "AULA").toUpperCase(),
            has_projector: room.has_projector == 1,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingRoom(null);
        setForm(EMPTY_FORM);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Indica o nome da sala."); return; }
        if (!form.capacity || Number(form.capacity) < 1) { toast.error("Indica uma lotação válida."); return; }

        setSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                capacity: parseInt(form.capacity, 10),
                type: form.type,
                has_projector: form.has_projector ? 1 : 0,
            };

            const res = editingRoom
                ? await roomService.update({ id: editingRoom.id, ...payload })
                : await roomService.create(payload);

            if (res.status === "sucesso") {
                toast.success(editingRoom ? "Sala atualizada!" : "Sala criada!");
                closeForm();
                loadRooms();
            } else {
                toast.error(translateMessage(res.mensagem || "Erro ao guardar sala."));
            }
        } catch {
            toast.error("Erro ao guardar sala.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (room) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Remover <strong>{room.name}</strong>? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const res = await roomService.delete(room.id);
                            if (res.status === "sucesso") {
                                setRooms(prev => prev.filter(r => r.id !== room.id));
                                toast.success("Sala removida!");
                            } else {
                                toast.error(translateMessage(res.mensagem || "Erro ao remover."));
                            }
                        } catch {
                            toast.error("Erro ao remover sala.");
                        }
                    }} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
                        Sim, remover
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const filtered = rooms.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "TODOS" || (r.type || "AULA").toUpperCase() === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                        <Building2 size={22} className="text-blue-500" />
                        Gerir Salas
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        Cria, edita e remove os espaços disponíveis na plataforma.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors hover:brightness-110 shrink-0"
                    style={{ background: "linear-gradient(135deg, #1e66ff, #4da3ff)" }}
                >
                    <Plus size={16} /> Nova Sala
                </button>
            </div>

            {/* Formulário inline */}
            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-5"
                    style={{ animation: "chatSlideUp 0.2s ease both" }}>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                {editingRoom ? <Pencil size={14} className="text-blue-600 dark:text-blue-400" /> : <Plus size={14} className="text-blue-600 dark:text-blue-400" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">
                                    {editingRoom ? `Editar — ${editingRoom.name}` : "Nova Sala"}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                    {editingRoom ? "Altera os dados da sala" : "Preenche os dados da nova sala"}
                                </p>
                            </div>
                        </div>
                        <button onClick={closeForm} className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Nome */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Nome da sala
                            </label>
                            <div className="relative">
                                <Type size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ex: Laboratório de Informática A"
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Lotação */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Lotação
                            </label>
                            <div className="relative">
                                <Users size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <input
                                    type="number"
                                    min="1"
                                    value={form.capacity}
                                    onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                                    placeholder="Ex: 30"
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Tipo */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Tipo
                            </label>
                            <select
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            >
                                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Projetor + botões */}
                        <div className="lg:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, has_projector: !f.has_projector }))}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                                    form.has_projector
                                        ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                        : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    form.has_projector ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-slate-500"
                                }`}>
                                    {form.has_projector && <Check size={11} className="text-white" />}
                                </div>
                                <Projector size={14} />
                                Tem projetor
                            </button>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button type="button" onClick={closeForm}
                                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 hover:brightness-110"
                                    style={{ background: "linear-gradient(135deg, #1e66ff, #4da3ff)" }}>
                                    {submitting
                                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <Save size={14} />
                                    }
                                    {editingRoom ? "Guardar" : "Criar Sala"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar por nome..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["TODOS", ...TYPE_OPTIONS].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                typeFilter === t
                                    ? "bg-blue-600 text-white"
                                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-blue-300"
                            }`}>
                            {t === "TODOS" ? "Todos" : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-slate-500">
                        <Building2 size={36} className="opacity-20" />
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Nenhuma sala encontrada.</p>
                        <p className="text-xs">Tenta ajustar os filtros ou cria uma nova sala.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Lotação</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Projetor</th>
                                        <th className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/60">
                                    {filtered.map(room => {
                                        const t = (room.type || "AULA").toUpperCase();
                                        const tc = typeConfig[t] || typeConfig["AULA"];
                                        return (
                                            <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{room.name}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>
                                                        {t}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
                                                        <Users size={13} className="text-gray-400" />
                                                        {room.capacity} pessoas
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {room.has_projector == 1 ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <Projector size={13} /> Sim
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEdit(room)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                                                            <Pencil size={12} /> Editar
                                                        </button>
                                                        <button onClick={() => handleDelete(room)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                            <Trash2 size={12} /> Remover
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-700/60">
                            {filtered.map(room => {
                                const t = (room.type || "AULA").toUpperCase();
                                const tc = typeConfig[t] || typeConfig["AULA"];
                                return (
                                    <div key={room.id} className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{room.name}</span>
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${tc.bg} ${tc.text}`}>{t}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><Users size={11} /> {room.capacity} pessoas</span>
                                            {room.has_projector == 1 && (
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><Projector size={11} /> Projetor</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(room)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                                                <Pencil size={12} /> Editar
                                            </button>
                                            <button onClick={() => handleDelete(room)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <Trash2 size={12} /> Remover
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
