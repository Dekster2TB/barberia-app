import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login'; // <-- IMPORTAR
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORTAR

function App() {
  return (
    <Routes>
      {/* Ruta Principal: Clientes */}
      <Route path="/" element={<BookingInterface />} />
      
      {/* Ruta de Login */}
      <Route path="/login" element={<Login />} />

      {/* RUTA PROTEGIDA: Solo accesible si el token es válido */}
      <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;