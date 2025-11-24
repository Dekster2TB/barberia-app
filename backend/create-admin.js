require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // ⚠️ CÁMBIALA POR UNA MÁS SEGURA

async function createAdmin() {
    try {
        await sequelize.authenticate();
        
        // Sincronizar solo la tabla de Usuarios, si es necesario
        await User.sync({ alter: true }); 

        const [user, created] = await User.findOrCreate({
            where: { username: ADMIN_USERNAME },
            defaults: { 
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD, // El hook en User.js lo hasheará automáticamente
                role: 'admin'
            }
        });

        if (created) {
            console.log(`✅ Usuario Admin '${ADMIN_USERNAME}' creado con éxito.`);
        } else {
            console.log(`⚠️ Usuario Admin '${ADMIN_USERNAME}' ya existe. No se modificó.`);
        }

    } catch (error) {
        console.error('❌ Error al crear admin:', error);
    } finally {
        // Salir del proceso de Node
        process.exit();
    }
}

createAdmin();