import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword'; 

function App() {
  return (
    <Routes>
      {/* Ruta Pública: Clientes */}
      <Route path="/" element={<BookingInterface />} />
      
      {/* Ruta Login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Protegidas: Admin */}
      <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}

export default App;