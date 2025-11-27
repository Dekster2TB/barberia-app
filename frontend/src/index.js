import React from 'react';
import ReactDOM from 'react-dom/client';
// 👇 CAMBIO CLAVE: Usamos un tema moderno (Lux) en lugar del default
import 'bootswatch/dist/lux/bootstrap.min.css'; 
// Si prefieres otro, prueba 'morph', 'quartz' o 'pulse'
import './index.css'; // Tus estilos personalizados (si los tienes)
import App from './App';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);