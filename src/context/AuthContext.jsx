import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ao abrir a app, verifica se já existe login guardado
        const storedUser = localStorage.getItem("roomly_user");
        const storedToken = localStorage.getItem("roomly_token");

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erro ao ler dados", error);
                localStorage.removeItem("roomly_user");
                localStorage.removeItem("roomly_token");
            }
        } else {
            // Se falta um dos dois, limpa ambos
            localStorage.removeItem("roomly_user");
            localStorage.removeItem("roomly_token");
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authService.login(email, password);

            if (res.status === "sucesso" && res.user && res.token) {
                setUser(res.user);
                localStorage.setItem("roomly_user", JSON.stringify(res.user));
                localStorage.setItem("roomly_token", res.token);
                return true;
            } else {
                throw new Error(res.mensagem || "Erro ao entrar");
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setLoading(true);
        setUser(null);
        localStorage.removeItem("roomly_user");
        localStorage.removeItem("roomly_token");

        setTimeout(() => {
            window.location.href = "/login";
        }, 100);
    };

    // Atualiza os dados do utilizador no contexto (ex: após editar perfil)
    const updateUser = (updatedUser) => {
        if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem("roomly_user", JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);