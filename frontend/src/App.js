import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- IMPORTAR LIBRERÍA
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword'; 

function App() {
  return (
    <>
      {/* Componente invisible que gestiona las notificaciones */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<BookingInterface />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas (Requieren Login) */}
        <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;