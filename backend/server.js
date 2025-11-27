const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- CONFIGURACIÓN E IMPORTACIONES ---
const sequelize = require('./src/config/db');

// Importar Modelos
const Service = require('./src/models/Service');
const User = require('./src/models/User'); 
const Reservation = require('./src/models/Reservation');
const Barber = require('./src/models/Barber');

// Importar Rutas
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const barberRoutes = require('./src/routes/barberRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
// 👇 ESTA ES LA IMPORTACIÓN QUE FALTABA
const managementRoutes = require('./src/routes/managementRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- RELACIONES ---
Service.hasMany(Reservation, { foreignKey: 'service_id' });
Reservation.belongsTo(Service, { foreignKey: 'service_id' });
Barber.hasMany(Reservation, { foreignKey: 'barber_id' });
Reservation.belongsTo(Barber, { foreignKey: 'barber_id' });

// --- MIDDLEWARES ---
const FRONTEND_URL = 'https://barberia-frontend-4e1s.onrender.com'; // Tu URL real

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin === 'http://localhost:3000' || origin === FRONTEND_URL) {
            return callback(null, true);
        }
        const msg = `El origen CORS ${origin} no está permitido.`;
        callback(new Error(msg), false);
    }
}));

app.use(express.json()); 

// --- REGISTRAR RUTAS ---

// Públicas
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes); 

// Auth
app.use('/api/auth', authRoutes);

// Privadas (Dev / Admin)
app.use('/api/finance', financeRoutes); 
// 👇 ESTA ES LA RUTA QUE FALTABA PARA QUE FUNCIONE EL CMS
app.use('/api/management', managementRoutes); 

app.get('/', (req, res) => {
    res.send('API de Agendamiento Funcionando 🚀');
});

// --- INICIO ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL exitosa.');
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

startServer();