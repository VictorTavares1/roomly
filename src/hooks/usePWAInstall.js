import { useState, useEffect } from "react";

export function usePWAInstall() {
    const [prompt, setPrompt] = useState(null);
    const [installed, setInstalled] = useState(
        () => localStorage.getItem("pwa_installed") === "true"
    );

    useEffect(() => {
        // Se o browser disparar beforeinstallprompt, a app NÃO está instalada
        const handlePrompt = (e) => {
            e.preventDefault();
            setPrompt(e);
            localStorage.removeItem("pwa_installed");
            setInstalled(false);
        };

        // Quando o utilizador instala, guarda no localStorage
        const handleInstalled = () => {
            localStorage.setItem("pwa_installed", "true");
            setInstalled(true);
            setPrompt(null);
        };

        // Se a app estiver a correr em modo standalone, está instalada
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
        }
    };

    return {
        canInstall: !!prompt && !installed,   // prompt disponível → botão de instalação direta
        canInstallManual: !installed,          // não instalada → mostrar botão mesmo sem prompt
        install,
    };
}
