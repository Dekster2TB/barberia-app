import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    // Validar que exista usuario Y que tenga un rol permitido
    // Ahora permitimos 'admin' Y 'developer'
    if (!user || (user.role !== 'admin' && user.role !== 'developer')) {
        // Si no cumple, lo enviamos al login
        return <Navigate to="/login" replace />;
    }

    // Si cumple, renderizamos la ruta hija (AdminPanel o DevDashboard)
    return <Outlet />;
};

export default ProtectedRoute;