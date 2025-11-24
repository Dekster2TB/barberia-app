import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    // Revisar: ¿Hay un usuario logueado Y tiene el rol 'admin'?
    if (!user || user.role !== 'admin') {
        // Si no cumple, lo enviamos al login
        return <Navigate to="/login" replace />;
    }

    // Si cumple, renderizamos la ruta hija (el AdminPanel)
    return <Outlet />;
};

export default ProtectedRoute;