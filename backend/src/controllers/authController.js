const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET; 
if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET no definida. Seguridad Comprometida.");
    process.exit(1);
}

// 1. Iniciar Sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        // Validación 1: El usuario existe
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Validación 2: La contraseña es correcta
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Si es válido: Crear el token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET,
            { expiresIn: '1d' } 
        );

        res.json({ 
            token, 
            user: { id: user.id, username: user.username, role: user.role } 
        });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ error: 'Fallo interno del servidor' });
    }
};

// 2. Cambiar Contraseña
exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id; // ID extraído del token seguro

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Importamos bcrypt aquí para hashear manualmente y asegurar compatibilidad
        // con hooks de actualización
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save(); 

        res.json({ message: 'Contraseña actualizada con éxito.' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Fallo al actualizar la contraseña.' });
    }
};