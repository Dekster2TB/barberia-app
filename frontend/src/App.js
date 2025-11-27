import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importar el Layout Maestro (Navbar + Footer)
import Layout from './components/Layout';

// Importación de Páginas/Componentes
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword';
import MyBookings from './components/MyBookings';
import DevDashboard from './components/DevDashboard';

function App() {
  return (
    <>
      {/* Sistema de Notificaciones (Siempre visible encima de todo) */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Envolvemos la navegación dentro del Layout para aplicar el diseño */}
      <Layout>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<BookingInterface />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />

          {/* --- RUTAS PROTEGIDAS --- */}
          <Route element={<ProtectedRoute />}>
              {/* Panel de Administración */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/password" element={<ChangePassword />} />
              
              {/* Panel de Desarrollador (Finanzas & CMS) */}
              <Route path="/dev-dashboard" element={<DevDashboard />} />
          </Route>
        </Routes>
      </Layout>
    </>
  );
}

export default App;