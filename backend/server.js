const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- 1. CONFIGURACIÓN E IMPORTACIONES ---
const sequelize = require('./src/config/db');

// Importar Modelos (El orden no importa aquí, las relaciones se definen abajo)
const Service = require('./src/models/Service');
const User = require('./src/models/User'); 
const Reservation = require('./src/models/Reservation');
const Barber = require('./src/models/Barber');

// Importar Rutas
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const barberRoutes = require('./src/routes/barberRoutes');
const financeRoutes = require('./src/routes/financeRoutes'); // <--- NUEVA RUTA FINANZAS

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. DEFINIR RELACIONES (MODELOS) ---

// Un Servicio tiene muchas Reservas
Service.hasMany(Reservation, { foreignKey: 'service_id' });
Reservation.belongsTo(Service, { foreignKey: 'service_id' });

// Un Barbero tiene muchas Reservas
Barber.hasMany(Reservation, { foreignKey: 'barber_id' });
Reservation.belongsTo(Barber, { foreignKey: 'barber_id' });

// --- 3. MIDDLEWARES DE SEGURIDAD ---

// URL REAL del Frontend en Render (Tu dominio de producción)
const FRONTEND_URL = 'https://barberia-frontend-4e1s.onrender.com';

// Configuración de CORS: Solo aceptamos peticiones de confianza
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (como Insomnia, cURL o Postman para pruebas)
        if (!origin) return callback(null, true);
        
        // Verificar si el origen es localhost (desarrollo) o la URL de producción
        if (origin === 'http://localhost:3000' || origin === FRONTEND_URL) {
            return callback(null, true);
        }
        
        // Rechazar cualquier otro origen (Protección contra uso no autorizado de tu API)
        const msg = `El origen CORS ${origin} no está permitido.`;
        callback(new Error(msg), false);
    }
}));

app.use(express.json()); // Permite recibir cuerpos JSON en las peticiones

// --- 4. REGISTRAR RUTAS (Endpoints) ---

// Rutas Públicas
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes); // Tiene endpoints públicos y protegidos internamente

// Ruta de Autenticación (Login)
app.use('/api/auth', authRoutes);

// Ruta Financiera (Solo Desarrollador)
app.use('/api/finance', financeRoutes); 

// Ruta de prueba base (Health Check)
app.get('/', (req, res) => {
    res.send('API de Agendamiento Funcionando 🚀');
});

// --- 5. INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL exitosa.');
        
        // Sincroniza modelos.
        // IMPORTANTE: En producción real se usan migraciones. 
        // 'alter: true' es seguro para cambios pequeños, pero NUNCA uses 'force: true' aquí.
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error fatal al iniciar el servidor:', error);
        process.exit(1); // Salir con error si la DB falla
    }
}

startServer();