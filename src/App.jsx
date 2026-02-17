import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importação das Páginas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import MyReservations from './pages/MyReservations';
import NewReservation from './pages/NewReservation';
import Settings from './pages/Settings';
import MyReports from './pages/MyReports';

// Páginas de Admin
import CreateRoom from './pages/CreateRoom';
import ManageUsers from './pages/ManageUsers';
import ManageReservations from './pages/ManageReservations';

// Páginas de manutenção
import ReportIssue from './pages/ReportIssue';
import ManageReports from './pages/ManageReports';

// Proteção de rotas
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">A carregar Roomly...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* === ROTAS PÚBLICAS === */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* === ROTAS PRIVADAS (Só com Login) === */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Rotas de Utilizador */}
      <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
      <Route path="/my-reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
      <Route path="/new-reservation" element={<PrivateRoute><NewReservation /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Reportar Problemas (qualquer user logado) */}
      <Route path="/report-issue" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
      <Route path="/my-reports" element={<PrivateRoute><MyReports /></PrivateRoute>} />

      {/* Manutenção (admin + funcionário) */}
      <Route path="/manage-reports" element={<StaffRoute><ManageReports /></StaffRoute>} />

      {/* Rotas de Admin (só admin) */}
      <Route path="/create-room" element={<AdminRoute><CreateRoom /></AdminRoute>} />
      <Route path="/manage-users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
      <Route path="/manage-reservations" element={<AdminRoute><ManageReservations /></AdminRoute>} />

      {/* Qualquer outra rota vai para a Landing Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}