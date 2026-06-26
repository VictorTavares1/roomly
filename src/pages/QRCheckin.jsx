import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle2, XCircle, Loader2, Camera } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../components/Layout";
import { reservationService } from "../services/api";

const STATE = { IDLE: "idle", SCANNING: "scanning", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function QRCheckin() {
    const [state, setState] = useState(STATE.IDLE);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const scannerRef = useRef(null);
    const scannerIdRef = useRef("qr-reader");

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {}).finally(() => {
                scannerRef.current = null;
            });
        }
    };

    const startScanner = async () => {
        setState(STATE.SCANNING);
        setResult(null);
        setErrorMsg("");

        const scanner = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = scanner;

        try {
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                async (decodedText) => {
                    stopScanner();
                    setState(STATE.LOADING);
                    try {
                        const res = await reservationService.checkin(decodedText);
                        setResult(res);
                        setState(STATE.SUCCESS);
                    } catch (err) {
                        setErrorMsg(err.message || "Erro ao fazer check-in.");
                        setState(STATE.ERROR);
                    }
                },
                () => {}
            );
        } catch {
            setErrorMsg("Não foi possível aceder à câmara. Verifica as permissões.");
            setState(STATE.ERROR);
        }
    };

    useEffect(() => () => stopScanner(), []);

    const reset = () => {
        stopScanner();
        setState(STATE.IDLE);
        setResult(null);
        setErrorMsg("");
    };

    return (
        <Layout>
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2.5">
                    <QrCode size={22} className="text-blue-500" />
                    Check-in por QR Code
                </h1>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                    Aponta a câmara para o QR Code da sala para confirmar a tua reserva.
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">

                    {/* Scanner */}
                    <div className={`relative bg-gray-900 ${state === STATE.SCANNING ? "block" : "hidden"}`}>
                        <div id="qr-reader" className="w-full" />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-60 h-60 border-2 border-white/60 rounded-2xl" />
                        </div>
                    </div>

                    {/* Estados */}
                    <div className="p-8 flex flex-col items-center gap-5 text-center">

                        {state === STATE.IDLE && (
                            <>
                                <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <QrCode size={36} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-slate-100">Pronto para fazer check-in</p>
                                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                                        Tens de ter uma reserva pendente para a sala no horário atual.
                                    </p>
                                </div>
                                <button
                                    onClick={startScanner}
                                    className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    <Camera size={16} /> Iniciar câmara
                                </button>
                            </>
                        )}

                        {state === STATE.SCANNING && (
                            <div className="w-full">
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">A aguardar leitura do QR Code...</p>
                                <button
                                    onClick={reset}
                                    className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        {state === STATE.LOADING && (
                            <>
                                <Loader2 size={40} className="text-blue-500 animate-spin" />
                                <p className="text-sm text-gray-500 dark:text-slate-400">A confirmar reserva...</p>
                            </>
                        )}

                        {state === STATE.SUCCESS && result && (
                            <>
                                <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <CheckCircle2 size={40} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Check-in confirmado!</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mt-2">{result.room_name}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                        {new Date(result.start_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} – {new Date(result.end_time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="cursor-pointer px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Novo check-in
                                </button>
                            </>
                        )}

                        {state === STATE.ERROR && (
                            <>
                                <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                    <XCircle size={40} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-600 dark:text-red-400">Check-in falhado</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{errorMsg}</p>
                                </div>
                                <button
                                    onClick={startScanner}
                                    className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    <Camera size={16} /> Tentar novamente
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    O check-in só é possível até <strong>15 minutos</strong> após o início da reserva e até <strong>5 minutos</strong> antes.
                </div>
            </div>
        </Layout>
    );
}
