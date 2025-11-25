const jwt = require('jsonwebtoken');

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

exports.protect = (req, res, next) => {
    // 1. Verificar si el token existe en los headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Formato: "Bearer TOKEN_AQUÍ" -> Cortamos "Bearer "
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Si no hay token, 401 Unauthorized
        return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    try {
        // 2. Verificar la validez del token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Opcional: Adjuntar el usuario decodificado a la petición para uso futuro
        req.user = decoded; 

        // 4. Si es válido, pasa al siguiente controlador
        next(); 
    } catch (error) {
        // Si el token es inválido (expiró, fue manipulado)
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar si el usuario tiene rol 'admin'
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Es admin, pasa
    } else {
        return res.status(403).json({ error: 'Acceso prohibido. Se requiere rol de administrador.' });
    }
};
// ... (código anterior de protect)

// ... 

exports.admin = (req, res, next) => {
    // Permitir si es admin O developer (el dev es super-admin)
    if (req.user && (req.user.role === 'admin' || req.user.role === 'developer')) {
        next();
    } else {
        return res.status(403).json({ error: 'Requiere rol Admin' });
    }
};

// NUEVO: Solo para Desarrollador
exports.developer = (req, res, next) => {
    if (req.user && req.user.role === 'developer') {
        next();
    } else {
        return res.status(403).json({ error: 'Acceso restringido al Desarrollador' });
    }
};