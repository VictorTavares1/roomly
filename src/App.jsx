import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import NewReservation from "./pages/NewReservation";
import MyReservations from "./pages/MyReservations";
import ManageUsers from "./pages/ManageUsers";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manage-users" element={<ManageUsers />} />

      <Route path="/rooms" element={<Rooms />} />
      <Route path="/new-reservation" element={<NewReservation />} />
      <Route path="/my-reservations" element={<MyReservations />} />
    </Routes>
  );
}