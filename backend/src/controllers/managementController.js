const Service = require('../models/Service');
const Barber = require('../models/Barber');

// --- SERVICIOS ---

exports.createService = async (req, res) => {
    try {
        const { name, duration_minutes, price, description } = req.body;
        if (!name || !duration_minutes || !price) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }
        const image_url = req.file ? req.file.path : null;
        const newService = await Service.create({ name, duration_minutes, price, description: description || '', image_url });
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ error: 'Error creando servicio' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration_minutes, price, description } = req.body;
        
        const service = await Service.findByPk(id);
        if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

        service.name = name;
        service.duration_minutes = duration_minutes;
        service.price = price;
        if (description !== undefined) service.description = description;
        if (req.file) service.image_url = req.file.path;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando servicio' });
    }
};

exports.deleteService = async (req, res) => {
    try {
        await Service.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
};

// --- BARBEROS ---

exports.createBarber = async (req, res) => {
    try {
        const { name, specialty, bio } = req.body;
        const image_url = req.file ? req.file.path : null;
        const newBarber = await Barber.create({ name, specialty, bio, image_url });
        res.status(201).json(newBarber);
    } catch (error) {
        res.status(500).json({ error: 'Error creando barbero' });
    }
};

// 👇 NUEVA FUNCIÓN: ACTUALIZAR BARBERO
exports.updateBarber = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialty, bio } = req.body;

        const barber = await Barber.findByPk(id);
        if (!barber) {
            return res.status(404).json({ error: 'Barbero no encontrado' });
        }

        // Actualizamos campos
        if (name) barber.name = name;
        if (specialty) barber.specialty = specialty;
        if (bio !== undefined) barber.bio = bio;

        // Si hay nueva foto, la actualizamos
        if (req.file) {
            barber.image_url = req.file.path;
        }

        await barber.save();
        res.json(barber);

    } catch (error) {
        console.error('Error updating barber:', error);
        res.status(500).json({ error: 'Error al actualizar barbero' });
    }
};

exports.deleteBarber = async (req, res) => {
    try {
        await Barber.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando barbero' });
    }
};