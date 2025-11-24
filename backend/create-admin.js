require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; 

async function createAdmin() {
    try {
        await sequelize.authenticate();
        
        // Sincronizar modelo
        await User.sync({ alter: true }); 

        const [user, created] = await User.findOrCreate({
            where: { username: ADMIN_USERNAME },
            defaults: { 
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD, 
                role: 'admin'
            }
        });

        if (created) {
            console.log(`✅ Usuario Admin '${ADMIN_USERNAME}' creado con éxito.`);
        } else {
            // --- LÓGICA DE LA OPCIÓN B (FORZAR ACTUALIZACIÓN) ---
            console.log(`⚠️ Usuario Admin ya existe. Actualizando contraseña...`);
            
            // Sobrescribimos la contraseña
            user.password = ADMIN_PASSWORD;
            
            // Al guardar, el hook 'beforeUpdate' o 'beforeSave' de Sequelize (si está configurado)
            // o el setter del modelo se encargará.
            // PERO: Como definimos el hook en 'beforeCreate', necesitamos asegurarnos 
            // de que también funcione al actualizar.
            
            // Truco Senior: Hasheamos manualmente aquí para asegurar que funcione 
            // sin tener que modificar el modelo User.js ahora mismo.
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
            
            await user.save();
            console.log(`🔄 Contraseña del Admin restablecida a: ${ADMIN_PASSWORD}`);
        }

    } catch (error) {
        console.error('❌ Error al gestionar admin:', error);
    } finally {
        process.exit();
    }
}

createAdmin();