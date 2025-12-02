const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- 1. CONFIGURACIÓN E IMPORTACIONES ---
const sequelize = require('./src/config/db');

// Importar Modelos
const Service = require('./src/models/Service');
const User = require('./src/models/User'); 
const Reservation = require('./src/models/Reservation');
const Barber = require('./src/models/Barber');
const SiteConfig = require('./src/models/SiteConfig'); 

// Importar Rutas
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const barberRoutes = require('./src/routes/barberRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const managementRoutes = require('./src/routes/managementRoutes');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. DEFINIR RELACIONES ---
Service.hasMany(Reservation, { foreignKey: 'service_id' });
Reservation.belongsTo(Service, { foreignKey: 'service_id' });

Barber.hasMany(Reservation, { foreignKey: 'barber_id' });
Reservation.belongsTo(Barber, { foreignKey: 'barber_id' });

// --- 3. MIDDLEWARE (CORS OPTIMIZADO) ---
const allowedOrigins = [
    'http://localhost:3000',      // Tu React local
    'http://127.0.0.1:3000',      // Tu React local (IP)
    'https://barberia-frontend-4e1s.onrender.com' // Tu web en producción
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o herramientas de servidor)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("🚫 Bloqueo CORS para origen:", origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json()); 

// --- 4. RUTAS ---
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes); 
app.use('/api/barbers', barberRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/config', configRoutes); 

app.get('/', (req, res) => {
    res.send('API de Agendamiento Funcionando 🚀');
});

// Manejo global de errores (para que no se caiga el server silenciosamente)
app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err.stack);
    res.status(500).send('Algo salió mal!');
});

// --- 5. INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos exitosa.');
        
        // { alter: true } revisa si agregaste columnas nuevas (como backgroundImageUrl) y actualiza la tabla
        await sequelize.sync({ alter: true }); 
        console.log('✅ Tablas sincronizadas (Alter Table ejecutado).');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error fatal al iniciar:', error);
    }
}

startServer();