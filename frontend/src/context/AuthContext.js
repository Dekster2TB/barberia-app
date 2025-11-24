import React, { createContext, useState, useEffect } from 'react';
import api from '../config/api'; // Usamos tu instancia de axios configurada

// 1. Crear el Contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 2. Estado: Cargar el token y el usuario desde localStorage al inicio
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);

    // 3. Efecto: Sincronizar el token con la API para futuras peticiones
    useEffect(() => {
        if (token) {
            // Adjuntar el token en el header por defecto para TODAS las peticiones
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            // Limpiar si no hay token
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
        
        // Guardar el usuario en localStorage
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [token, user]);

    // 4. Función de Logout
    const logout = () => {
        setUser(null);
        setToken(null);
    };

    // 5. Exponer el estado y las funciones al resto de la aplicación
    const contextValue = {
        user,
        token,
        loading,
        setToken,
        setUser,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};