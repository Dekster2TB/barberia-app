const SiteConfig = require('../models/SiteConfig');

exports.getConfig = async (req, res) => {
    try {
        const [config, created] = await SiteConfig.findOrCreate({
            where: { id: 1 },
            defaults: {
                appName: 'Mi Barbería',
                welcomeTitle: 'Reserva tu Cita', // Valor por defecto
                footerText: 'Reserva tu hora online',
                whatsappNumber: '56900000000',
                logoUrl: null,
                backgroundImageUrl: null 
            }
        });
        res.json(config);
    } catch (error) {
        console.error("Error config:", error);
        res.status(500).json({ msg: 'Error al obtener configuración' });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        // Recibimos el nuevo campo welcomeTitle
        const { appName, welcomeTitle, footerText, whatsappNumber, logoUrl, backgroundImageUrl } = req.body;

        let config = await SiteConfig.findByPk(1);

        if (!config) {
            config = await SiteConfig.create({
                id: 1, appName, welcomeTitle, footerText, whatsappNumber, logoUrl, backgroundImageUrl
            });
        } else {
            // Actualizamos campos existentes
            if (appName !== undefined) config.appName = appName;
            if (footerText !== undefined) config.footerText = footerText;
            if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
            if (logoUrl !== undefined) config.logoUrl = logoUrl;
            if (backgroundImageUrl !== undefined) config.backgroundImageUrl = backgroundImageUrl;
            
            // Actualizamos el nuevo título central
            if (welcomeTitle !== undefined) config.welcomeTitle = welcomeTitle;

            await config.save();
        }
        res.json({ msg: 'Configuración actualizada', config });
    } catch (error) {
        console.error("Error update:", error);
        res.status(500).json({ msg: 'Error al guardar configuración' });
    }
};