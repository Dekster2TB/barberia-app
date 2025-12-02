import React, { createContext, useState, useEffect } from 'react';
import api from '../config/api';

// Creamos el contexto que se podrá consumir en cualquier parte de la app
export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    // Estado inicial por defecto mientras carga la data real
    const [config, setConfig] = useState({
        appName: 'Cargando...',
        footerText: '',
        whatsappNumber: ''
    });

    // Función para pedir la configuración al Backend
    const fetchConfig = async () => {
        try {
            const res = await api.get('/api/config');
            // Actualizamos el estado con lo que viene de la base de datos
            setConfig(res.data);
        } catch (error) {
            console.error("Error cargando config:", error);
            // Si falla, ponemos valores genéricos para que no se rompa la web
            setConfig({ 
                appName: 'Mi Barbería', 
                footerText: 'Reserva tu hora online', 
                whatsappNumber: '' 
            });
        }
    };

    // Ejecutar fetchConfig automáticamente cuando la app se abre por primera vez
    useEffect(() => {
        fetchConfig();
    }, []);

    // Proveemos 'config' (los datos) y 'fetchConfig' (para recargar si editamos)
    return (
        <ConfigContext.Provider value={{ config, fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};