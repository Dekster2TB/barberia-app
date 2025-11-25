require('dotenv').config();
const sequelize = require('./src/config/db');
// Importar TODOS los modelos para que se creen las tablas en orden
require('./src/models/Service');
require('./src/models/User');
const Barber = require('./src/models/Barber'); // <---
require('./src/models/Reservation'); // Reserva depende de Barber y Service

async function nukeDatabase() {
    console.log('☢️  INICIANDO OPERACIÓN NUCLEAR...');
    try {
        await sequelize.authenticate();
        await sequelize.drop({ cascade: true });
        await sequelize.sync({ force: true });

        console.log('🌱 Sembrando datos iniciales...');
        
        // Crear Barberos por defecto
        await Barber.bulkCreate([
            { name: 'Juan "El Tijeras"', specialty: 'Corte Clásico' },
            { name: 'Carlos Fade', specialty: 'Degradados' },
            { name: 'Ana Estilista', specialty: 'Color y Peinado' }
        ]);

        console.log('✨ ÉXITO TOTAL. Barberos creados.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Falló la operación:', error);
        process.exit(1);
    }
}

nukeDatabase();