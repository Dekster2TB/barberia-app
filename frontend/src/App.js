import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importar Componentes
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword';
import MyBookings from './components/MyBookings';
import DevDashboard from './components/DevDashboard'; // Si implementaste el panel de finanzas

function App() {
  return (
    <>
      {/* Sistema de Notificaciones Globales */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* --- RUTAS PÚBLICAS (Clientes) --- */}
        
        {/* Página Principal: Flujo de Reserva */}
        <Route path="/" element={<BookingInterface />} />
        
        {/* Página de Gestión de Cliente: Ver y Cancelar Citas */}
        <Route path="/my-bookings" element={<MyBookings />} />
        
        {/* Página de Login (Admin/Dev) */}
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PROTEGIDAS (Admin y Dev) --- */}
        <Route element={<ProtectedRoute />}>
            {/* Panel de Administración (Gestión de Citas) */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Cambio de Contraseña */}
            <Route path="/admin/password" element={<ChangePassword />} />
            
            {/* Panel de Desarrollador (Finanzas) */}
            {/* Solo accesible si el usuario tiene rol 'developer', el backend lo valida */}
            <Route path="/dev-dashboard" element={<DevDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;