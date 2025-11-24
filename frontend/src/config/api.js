import axios from 'axios';

const api = axios.create({
    // LÓGICA: Si estamos en localhost, usa el proxy. 
    // Si estamos en la nube, usa la URL real de Render.
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://barberia-backend-api.onrender.com' // <--- ¡PON TU URL DE RENDER AQUÍ!
        : '/' 
});

export default api;