require('dotenv').config();
const sequelize = require('./src/config/db');
// Importar modelos para que Sequelize sepa qué borrar/crear
require('./src/models/Service');
require('./src/models/User');
require('./src/models/Reservation');

async function nukeDatabase() {
    console.log('☢️  INICIANDO OPERACIÓN NUCLEAR EN LA BASE DE DATOS...');
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a Neon.tech');

        // Esto borra TODAS las tablas a la fuerza
        console.log('🗑️  Borrando tablas antiguas...');
        await sequelize.drop({ cascade: true });

        // Esto crea las tablas desde cero
        console.log('🏗️  Creando tablas nuevas limpias...');
        await sequelize.sync({ force: true });

        console.log('✨ ÉXITO TOTAL. La base de datos está limpia y nueva.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Falló la operación:', error);
        process.exit(1);
    }
}

nukeDatabase();