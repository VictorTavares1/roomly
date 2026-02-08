import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importação das Páginas
import Landing from './pages/Landing'; // <--- NOVA PÁGINA (A Capa do Site)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import MyReservations from './pages/MyReservations';
import NewReservation from './pages/NewReservation';
import Settings from './pages/Settings';

// Páginas de Admin
import CreateRoom from './pages/CreateRoom';
import ManageUsers from './pages/ManageUsers';
import ManageReservations from './pages/ManageReservations';

// Componente para proteger rotas (Só entra se tiver login)
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">A carregar Roomly...</div>;
  }

  // MUDANÇA: Se não tiver logado, manda para /login (em vez da Landing Page)
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* === ROTAS PÚBLICAS === */}

      {/* A Raiz agora é a Landing Page (Apresentação) */}
      <Route path="/" element={<Landing />} />

      {/* O Login agora tem um endereço próprio */}
      <Route path="/login" element={<Login />} />


      {/* === ROTAS PRIVADAS (Só com Login) === */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Rotas de Utilizador */}
      <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
      <Route path="/my-reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
      <Route path="/new-reservation" element={<PrivateRoute><NewReservation /></PrivateRoute>} />

      {/* Rota de Definições */}
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Rotas de Admin */}
      <Route path="/create-room" element={<PrivateRoute><CreateRoom /></PrivateRoute>} />
      <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
      <Route path="/manage-reservations" element={<PrivateRoute><ManageReservations /></PrivateRoute>} />

      {/* Qualquer outra rota desconhecida vai para a Landing Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}