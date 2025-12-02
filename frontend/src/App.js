import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 1. Importar el Contexto de Configuración (Nombres editables)
import { ConfigProvider } from './context/ConfigContext';

// 2. Importar el Layout Maestro (Navbar y Footer)
import Layout from './components/Layout';

// 3. Importar Páginas y Componentes
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword';
import MyBookings from './components/MyBookings';
import DevDashboard from './components/DevDashboard';

function App() {
  return (
    <ConfigProvider> {/* Envoltura Global de Datos */}
      
      {/* Notificaciones flotantes */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Layout: Contiene el Navbar y el Footer */}
      <Layout>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          
          {/* Página Principal (Reservas) */}
          <Route path="/" element={<BookingInterface />} />
          
          {/* Página de Clientes (Ver/Cancelar Citas) */}
          <Route path="/my-bookings" element={<MyBookings />} />
          
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* --- RUTAS PROTEGIDAS (Admin y Dev) --- */}
          <Route element={<ProtectedRoute />}>
              {/* Gestión de Citas */}
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* Cambio de Clave */}
              <Route path="/admin/password" element={<ChangePassword />} />
              
              {/* Panel Maestro (Finanzas y CMS) */}
              <Route path="/dev-dashboard" element={<DevDashboard />} />
          </Route>
        </Routes>
      </Layout>
      
    </ConfigProvider>
  );
}

export default App;