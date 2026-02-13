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

// Páginas de Admin
import CreateRoom from './pages/CreateRoom';
import ManageUsers from './pages/ManageUsers';
import ManageReservations from './pages/ManageReservations';

import ReportIssue from './pages/ReportIssue';
import ManageReports from './pages/ManageReports';
import MyReports from './pages/MyReports';
import EditRoom from './pages/EditRoom';
import EditReservation from './pages/EditReservation';

// Protege rotas que requerem login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">A carregar Roomly...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

// Protege rotas por role (ex: só admin, ou admin + funcionário)
function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">A carregar Roomly...</div>;
  }

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ unauthorized: true }} replace />;
  }

  return children;
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

      {/* Reportar e ver reports (todos os utilizadores) */}
      <Route path="/report-issue" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
      <Route path="/my-reports" element={<PrivateRoute><MyReports /></PrivateRoute>} />

      {/* Editar Sala (apenas admin) / Reserva (dono ou admin) */}
      <Route path="/edit-room" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><EditRoom /></RoleRoute></PrivateRoute>} />
      <Route path="/edit-reservation" element={<PrivateRoute><EditReservation /></PrivateRoute>} />

      {/* Rotas de Manutenção (admin + funcionário) */}
      <Route path="/manage-reports" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'funcionario']}><ManageReports /></RoleRoute></PrivateRoute>} />

      {/* Rotas de Admin (apenas admin) */}
      <Route path="/create-room" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><CreateRoom /></RoleRoute></PrivateRoute>} />
      <Route path="/manage-users" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><ManageUsers /></RoleRoute></PrivateRoute>} />
      <Route path="/manage-reservations" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><ManageReservations /></RoleRoute></PrivateRoute>} />

      {/* Qualquer outra rota vai para a Landing Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}