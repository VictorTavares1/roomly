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
import RoomDetail from './pages/RoomDetail';

// Páginas de Admin
import ManageRooms from './pages/ManageRooms';
import ManageUsers from './pages/ManageUsers';
import ManageReservations from './pages/ManageReservations';
import EditReservation from './pages/EditReservation';

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
      <Route path="/room-detail" element={<PrivateRoute><RoomDetail /></PrivateRoute>} />
      <Route path="/new-reservation" element={<PrivateRoute><NewReservation /></PrivateRoute>} />
      <Route path="/edit-reservation" element={<PrivateRoute><EditReservation /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* Suporte técnico — my-reports redireciona para a página unificada */}
      <Route path="/report-issue" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
      <Route path="/my-reports" element={<Navigate to="/report-issue" replace />} />

      {/* Manutenção (admin + funcionário) */}
      <Route path="/manage-reports" element={<StaffRoute><ManageReports /></StaffRoute>} />

      {/* Rotas de Admin (só admin) */}
      <Route path="/manage-rooms" element={<AdminRoute><ManageRooms /></AdminRoute>} />
      <Route path="/manage-users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
      <Route path="/manage-reservations" element={<AdminRoute><ManageReservations /></AdminRoute>} />

      {/* Qualquer outra rota vai para a Landing Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}