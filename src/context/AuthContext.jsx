import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api"; // <--- IMPORTANTE: Importar o serviço

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ao abrir a app, verifica se já existe login guardado
        // Mudei a chave para "roomly_user" para evitar conflitos com outros projetos
        const storedUser = localStorage.getItem("roomly_user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erro ao ler dados", error);
                localStorage.removeItem("roomly_user");
            }
        }
        setLoading(false);
    }, []);

    // AQUI ESTAVA O PROBLEMA: Agora a função faz o pedido à API!
    const login = async (email, password) => {
        try {
            // 1. Pede à API para verificar o login
            const res = await authService.login(email, password);

            // 2. Se a API disser "sucesso", guarda os dados
            if (res.status === "sucesso" && res.user) {
                setUser(res.user);
                localStorage.setItem("roomly_user", JSON.stringify(res.user));
                return true;
            } else {
                throw new Error(res.mensagem || "Erro ao entrar");
            }
        } catch (error) {
            // Passa o erro para o Login.jsx mostrar a mensagem vermelha
            throw error;
        }
    };

    const logout = () => {
        setLoading(true);
        setUser(null);
        localStorage.removeItem("roomly_user"); // Remove a chave certa

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