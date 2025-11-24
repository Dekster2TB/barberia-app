const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET; 
if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET no definida. Seguridad Comprometida.");
    process.exit(1);
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        // Validación 1: El usuario existe
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Validación 2: La contraseña es correcta (usando el método auxiliar del modelo)
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Si es válido: Crear el token de seguridad
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Payload: lo que el token lleva dentro
            JWT_SECRET,
            { expiresIn: '1d' } // Expira en 1 día
        );

        // Devolvemos el token. El frontend lo guardará.
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ error: 'Fallo interno del servidor' });
    }
};