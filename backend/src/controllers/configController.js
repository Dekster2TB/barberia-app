const SiteConfig = require('../models/SiteConfig');

// --- OBTENER CONFIGURACIÓN ---
// Endpoint: GET /api/config
exports.getConfig = async (req, res) => {
    try {
        // Busca la configuración con ID 1. Si no existe, crea una por defecto.
        const [config, created] = await SiteConfig.findOrCreate({
            where: { id: 1 },
            defaults: {
                appName: 'Mi Barbería',
                footerText: 'Reserva tu hora online',
                whatsappNumber: '56900000000',
                logoUrl: null // Por defecto inicia sin logo
            }
        });
        res.json(config);
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        res.status(500).json({ msg: 'Error al obtener configuración' });
    }
};

// --- ACTUALIZAR CONFIGURACIÓN ---
// Endpoint: PUT /api/config
exports.updateConfig = async (req, res) => {
    try {
        // Recibimos los datos del frontend (incluyendo la URL de la imagen si la hay)
        const { appName, footerText, whatsappNumber, logoUrl } = req.body;

        // Buscamos la fila única (ID 1)
        let config = await SiteConfig.findByPk(1);

        if (!config) {
            // Caso de seguridad: Si no existe, la creamos desde cero
            config = await SiteConfig.create({
                id: 1,
                appName,
                footerText,
                whatsappNumber,
                logoUrl
            });
        } else {
            // Si existe, actualizamos los campos solo si se envían en la petición
            if (appName !== undefined) config.appName = appName;
            if (footerText !== undefined) config.footerText = footerText;
            if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
            
            // Solo actualizamos logoUrl si viene un valor (para no borrarlo accidentalmente si no se envía)
            if (logoUrl !== undefined) config.logoUrl = logoUrl;

            await config.save();
        }

        res.json({ msg: 'Configuración actualizada con éxito', config });
    } catch (error) {
        console.error("Error actualizando configuración:", error);
        res.status(500).json({ msg: 'Error al guardar configuración' });
    }
};