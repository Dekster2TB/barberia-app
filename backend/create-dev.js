require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');

const DEV_USERNAME = 'dev_master';
// 👇 TU CONTRASEÑA EXACTA (Cuidado con los espacios al final)
const DEV_PASSWORD = 'Developer3000'; 

async function createDev() {
    console.log('🔥 Iniciando reinicio de cuenta Developer...');
    
    try {
        await sequelize.authenticate();
        
        // 1. BORRAR EL USUARIO SI EXISTE (Limpieza total)
        console.log(`🗑️  Borrando usuario '${DEV_USERNAME}' antiguo...`);
        await User.destroy({ where: { username: DEV_USERNAME } });

        // 2. CREARLO DE NUEVO DESDE CERO
        console.log(`✨ Creando nuevo usuario '${DEV_USERNAME}'...`);
        
        // El modelo User ya tiene un hook 'beforeCreate' que hashea la password automáticamente
        await User.create({
            username: DEV_USERNAME,
            password: DEV_PASSWORD, 
            role: 'developer'
        });

        console.log(`✅ ¡ÉXITO TOTAL! Usuario creado.`);
        console.log(`👤 User: ${DEV_USERNAME}`);
        console.log(`🔑 Pass: ${DEV_PASSWORD}`);

    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        process.exit();
    }
}

createDev();