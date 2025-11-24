import axios from 'axios';

const api = axios.create({
    // En desarrollo local, forzamos la URL local del backend
    // En producción, usará la URL de Render
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://barberia-backend-api.onrender.com' 
        : 'http://localhost:5000' 
});

export default api;