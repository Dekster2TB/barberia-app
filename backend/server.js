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
const authRoutes = require('./src/routes/authRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. DEFINIR RELACIONES ---
// Un Servicio tiene muchas Reservas
Service.hasMany(Reservation, { foreignKey: 'service_id' });
// Una Reserva pertenece a un Servicio
Reservation.belongsTo(Service, { foreignKey: 'service_id' });

// --- 3. MIDDLEWARE ---

// URL REAL del Frontend en Render (¡Tu dominio!)
const FRONTEND_URL = 'https://barberia-frontend-4e1s.onrender.com';

// Configuración de CORS para aceptar solo peticiones de tu frontend
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (como Insomnia o Curl)
        if (!origin) return callback(null, true);
        
        // Verificar si el origen es localhost (para desarrollo) o la URL de producción
        if (origin === 'http://localhost:3000' || origin === FRONTEND_URL) {
            return callback(null, true);
        }
        
        // Rechazar cualquier otro origen
        const msg = `El origen CORS ${origin} no está permitido.`;
        callback(new Error(msg), false);
    }
}));

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
        
        // Sincroniza modelos. Se mantiene {alter: true} para que recoja cualquier 
        // cambio en el modelo User (hashing) si es necesario, pero se debe quitar 
        // si se pasa a migraciones.
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