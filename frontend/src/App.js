import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importación de Componentes
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword';
import MyBookings from './components/MyBookings'; // <--- Importamos el componente de Mis Reservas

function App() {
  return (
    <>
      {/* Configuración de las notificaciones toast */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        
        {/* Página principal de reservas */}
        <Route path="/" element={<BookingInterface />} />
        
        {/* Página para que el cliente vea y cancele sus citas */}
        <Route path="/my-bookings" element={<MyBookings />} />
        
        {/* Página de inicio de sesión para el administrador */}
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PROTEGIDAS (ADMINISTRADOR) --- */}
        <Route element={<ProtectedRoute />}>
            {/* Panel de control principal */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Formulario para cambiar contraseña */}
            <Route path="/admin/password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;