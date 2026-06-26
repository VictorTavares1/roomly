import { useEffect, useRef, useState } from "react";
import { QrCode, Download, Printer, DoorOpen, Search, Filter, ChevronDown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Layout from "../components/Layout";
import { roomService } from "../services/api";

const TYPE_OPTIONS = ["AULA", "LABORATÓRIO", "REUNIÃO", "AUDITÓRIO"];

const TYPE_LABELS = {
    AULA: "Aula",
    "LABORATÓRIO": "Laboratório",
    REUNIÃO: "Reunião",
    AUDITÓRIO: "Auditório",
};

function RoomQRCard({ room }) {
    const cardRef = useRef(null);

    const handlePrint = () => {
        const svgEl = cardRef.current?.querySelector("svg");
        if (!svgEl) return;

        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
            <html><head><title>QR - ${room.name}</title>
            <style>
                body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; background: white; }
                img { width: 240px; height: 240px; }
                h2 { margin: 16px 0 4px; font-size: 20px; font-weight: 700; color: #1e293b; }
                p { margin: 0; font-size: 13px; color: #64748b; }
                @media print { button { display: none; } }
            </style></head>
            <body>
                <img src="${url}" />
                <h2>${room.name}</h2>
                <p>${TYPE_LABELS[room.type] || room.type} · Capacidade: ${room.capacity}</p>
            </body></html>
        `);
        win.document.close();
        win.onload = () => { win.print(); URL.revokeObjectURL(url); };
    };

    const handleDownload = () => {
        const svgEl = cardRef.current?.querySelector("svg");
        if (!svgEl) return;

        const svgData = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-${room.name.toLowerCase().replace(/\s+/g, "-")}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div ref={cardRef} className="p-3 bg-white rounded-xl border border-gray-100">
                <QRCodeSVG
                    value={room.qr_token}
                    size={180}
                    level="M"
                    includeMargin={false}
                />
            </div>

            <div className="text-center">
                <p className="font-bold text-gray-800 dark:text-slate-100">{room.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {TYPE_LABELS[room.type] || room.type} · {room.capacity} pessoas
                </p>
            </div>

            <div className="flex gap-2 w-full">
                <button
                    onClick={handleDownload}
                    title="Descarregar SVG"
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                    <Download size={13} /> Descarregar
                </button>
                <button
                    onClick={handlePrint}
                    title="Imprimir QR Code"
                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                    <Printer size={13} /> Imprimir
                </button>
            </div>
        </div>
    );
}

export default function QRCodes() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("TODOS");
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        roomService.getQRCodes()
            .then((res) => setRooms(res.rooms || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = rooms.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
            (TYPE_LABELS[r.type] || r.type).toLowerCase().includes(search.toLowerCase());
        const matchFilter = typeFilter === "TODOS" || r.type === typeFilter;
        return matchSearch && matchFilter;
    });

    return (
        <Layout>
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                    <QrCode size={22} className="text-blue-500" />
                    QR Codes das Salas
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    Imprime ou descarrega os QR Codes para afixar em cada sala.
                </p>
            </div>

            {/* Pesquisa + filtro */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar por nome..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>

                <div ref={filterRef} className="relative shrink-0">
                    <button
                        onClick={() => setFilterOpen(v => !v)}
                        className="cursor-pointer relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-150"
                    >
                        <Filter size={14} />
                        Filtro
                        <ChevronDown size={13} className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`} />
                        {typeFilter !== "TODOS" && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                        )}
                    </button>

                    {filterOpen && (
                        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden z-20">
                            {["TODOS", ...TYPE_OPTIONS].map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setTypeFilter(t); setFilterOpen(false); }}
                                    className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-100 ${
                                        typeFilter === t
                                            ? "bg-gray-50 dark:bg-slate-700/50 text-gray-800 dark:text-slate-100 font-semibold"
                                            : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                    }`}
                                >
                                    {t === "TODOS" ? "Todos" : TYPE_LABELS[t] || t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 h-72 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-slate-500">
                    <DoorOpen size={40} className="opacity-20" />
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Nenhuma sala encontrada.</p>
                    <p className="text-xs">Tenta ajustar os filtros ou a pesquisa.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((room) => (
                        <RoomQRCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </Layout>
    );
}
