import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">A carregar Roomly...</div>;
    }

    if (!user) return <Navigate to="/login" />;

    if (user.role !== "admin") {
        return <Navigate to="/dashboard" state={{ unauthorized: true }} />;
    }

    return children;
}
