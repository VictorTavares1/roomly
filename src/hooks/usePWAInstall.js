import { useState, useEffect } from "react";

// Captura o evento o mais cedo possível, antes do React montar
let _earlyPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _earlyPrompt = e;
});

export function usePWAInstall() {
    const [prompt, setPrompt] = useState(() => _earlyPrompt);
    const [installed, setInstalled] = useState(
        () =>
            localStorage.getItem("pwa_installed") === "true" ||
            window.matchMedia("(display-mode: standalone)").matches
    );

    useEffect(() => {
        // Apanha eventos que cheguem depois da montagem
        const handlePrompt = (e) => {
            e.preventDefault();
            _earlyPrompt = e;
            setPrompt(e);
            localStorage.removeItem("pwa_installed");
            setInstalled(false);
        };

        const handleInstalled = () => {
            localStorage.setItem("pwa_installed", "true");
            setInstalled(true);
            setPrompt(null);
            _earlyPrompt = null;
        };

        if (window.matchMedia("(display-mode: standalone)").matches) {
            localStorage.setItem("pwa_installed", "true");
            setInstalled(true);
        }

        window.addEventListener("beforeinstallprompt", handlePrompt);
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handlePrompt);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    const install = async () => {
        if (!prompt) return;
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
            localStorage.setItem("pwa_installed", "true");
            setInstalled(true);
            setPrompt(null);
            _earlyPrompt = null;
        }
    };

    return {
        canInstall: !!prompt && !installed,
        canInstallManual: !installed,
        install,
    };
}
