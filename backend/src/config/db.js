const { Sequelize } = require('sequelize');
require('dotenv').config();

// Verificamos que la URL exista
if (!process.env.DATABASE_URL) {
    console.error("❌ Error fatal: DATABASE_URL no está definida en el archivo .env");
    process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Ponlo en 'console.log' si quieres ver las consultas SQL crudas
    dialectOptions: {
        ssl: {
            require: true, 
            // rejectUnauthorized: false es necesario para muchas conexiones externas 
            // para evitar errores de "self-signed certificate"
            rejectUnauthorized: false 
        }
    }
});

module.exports = sequelize;