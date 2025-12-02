const SiteConfig = require('../models/SiteConfig');

// --- OBTENER CONFIGURACIÓN ---
exports.getConfig = async (req, res) => {
    try {
        const [config, created] = await SiteConfig.findOrCreate({
            where: { id: 1 },
            defaults: {
                appName: 'Mi Barbería',
                footerText: 'Reserva tu hora online',
                whatsappNumber: '56900000000',
                logoUrl: null,
                // Default: sin imagen de fondo
                backgroundImageUrl: null 
            }
        });
        res.json(config);
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        res.status(500).json({ msg: 'Error al obtener configuración' });
    }
};

// --- ACTUALIZAR CONFIGURACIÓN ---
exports.updateConfig = async (req, res) => {
    try {
        // 2. RECIBIMOS EL NUEVO CAMPO backgroundImageUrl
        const { appName, footerText, whatsappNumber, logoUrl, backgroundImageUrl } = req.body;

        let config = await SiteConfig.findByPk(1);

        if (!config) {
            config = await SiteConfig.create({
                id: 1,
                appName,
                footerText,
                whatsappNumber,
                logoUrl,
                backgroundImageUrl // Guardar al crear
            });
        } else {
            if (appName !== undefined) config.appName = appName;
            if (footerText !== undefined) config.footerText = footerText;
            if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
            
            // Actualizamos Logo si viene el dato (puede ser null para borrarlo)
            if (logoUrl !== undefined) config.logoUrl = logoUrl;

            // 3. ACTUALIZAMOS FONDO SI VIENE EL DATO (puede ser null para borrarlo)
            if (backgroundImageUrl !== undefined) config.backgroundImageUrl = backgroundImageUrl;

            await config.save();
        }

        res.json({ msg: 'Configuración actualizada con éxito', config });
    } catch (error) {
        console.error("Error actualizando configuración:", error);
        res.status(500).json({ msg: 'Error al guardar configuración' });
    }
};