import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Routes>
      {/* Si entran a la raíz, ven la Barbería para Clientes */}
      <Route path="/" element={<BookingInterface />} />
      
      {/* Si entran a /admin, ven la Tabla de Reservas */}
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;