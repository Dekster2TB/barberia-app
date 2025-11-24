import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORTANTE
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider> {/* <-- APLICAR EL PROVEEDOR AQUÍ */}
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);