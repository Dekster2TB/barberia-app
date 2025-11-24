const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- 1. CONFIGURACIÓN E IMPORTACIONES ---
const sequelize = require('./src/config/db');

// Importar Modelos (para instanciarlos y definir relaciones)
const Service = require('./src/models/Service');
const User = require('./src/models/User'); 
const Reservation = require('./src/models/Reservation');

// Importar Rutas (Endpoints)
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes'); // Nueva ruta de seguridad

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. DEFINIR RELACIONES ---
// Un Servicio tiene muchas Reservas
Service.hasMany(Reservation, { foreignKey: 'service_id' });
// Una Reserva pertenece a un Servicio
Reservation.belongsTo(Service, { foreignKey: 'service_id' });

// --- 3. MIDDLEWARE ---
app.use(cors()); // Manejo de CORS
app.use(express.json()); // Permite recibir cuerpos JSON en las peticiones

// --- 4. USAR RUTAS (Endpoints) ---

// Rutas Públicas (Servicios, Reservas)
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes); 

// Ruta de Autenticación (Login)
app.use('/api/auth', authRoutes);

// Ruta de prueba base
app.get('/', (req, res) => {
    res.send('API de Agendamiento Funcionando 🚀');
});

// --- 5. INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL exitosa.');
        
        // Sincroniza modelos. 'alter: true' se quita si se usó reset.js, pero se mantiene 
        // para asegurar que el modelo User (con el hook de hashing) se actualice.
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