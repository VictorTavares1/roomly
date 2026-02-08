import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para não mostrar a app enquanto verifica o login

    useEffect(() => {
        // Ao abrir a app, verifica se já existe login guardado
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // ... (resto do código em cima igual)

    const logout = () => {
        setLoading(true); // <--- O TRUQUE MÁGICO! (Baixa a cortina imediatamente)

        setUser(null);
        localStorage.removeItem("user");

        // Pequeno atraso para garantir que a UI não pisca
        setTimeout(() => {
            window.location.href = "/";
        }, 100);
    };

    // ... (resto do código em baixo igual)

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* Só mostra o site depois de verificar se o user está logado */}
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para ser mais fácil usar
export const useAuth = () => useContext(AuthContext);