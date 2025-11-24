const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configuración de base de datos
const sequelize = require('./src/config/db');

// 1. IMPORTAR MODELOS
const Service = require('./src/models/Service');
const User = require('./src/models/User');
const Reservation = require('./src/models/Reservation');

// 2. DEFINIR RELACIONES (AQUÍ ES SEGURO)
// Un Servicio tiene muchas Reservas
Service.hasMany(Reservation, { foreignKey: 'service_id' });
// Una Reserva pertenece a un Servicio
Reservation.belongsTo(Service, { foreignKey: 'service_id' });

// 3. RUTAS
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json());

// --- USAR RUTAS ---
// Todas las peticiones a /api/services irán al serviceRoutes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes); 

// Ruta de prueba base
app.get('/', (req, res) => {
    res.send('API de Agendamiento Funcionando 🚀');
});

// --- INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL exitosa.');
        
        await sequelize.sync();
        console.log('✅ Modelos sincronizados.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

startServer();