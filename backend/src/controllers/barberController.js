const Barber = require('../models/Barber');

// Obtener la lista completa de barberos
exports.getBarbers = async (req, res) => {
    try {
        const barbers = await Barber.findAll();
        res.json(barbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de barberos' });
    }
};