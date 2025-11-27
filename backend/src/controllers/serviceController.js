const Service = require('../models/Service');

// Obtener todos los servicios (Público)
exports.getServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};

// --- CREAR UN NUEVO SERVICIO (Admin/Dev) ---
exports.createService = async (req, res) => {
    try {
        const { name, duration_minutes, price, description } = req.body;

        // Validación básica
        if (!name || !duration_minutes || !price) {
            return res.status(400).json({ error: 'Nombre, duración y precio son obligatorios.' });
        }

        // Manejo de imagen (si usas Cloudinary)
        const image_url = req.file ? req.file.path : null;

        const newService = await Service.create({
            name,
            duration_minutes,
            price,
            description,
            image_url
        });

        res.status(201).json(newService);
    } catch (error) {
        console.error('Error al crear servicio:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe un servicio con este nombre.' });
        }
        res.status(500).json({ error: 'Error interno al crear el servicio.' });
    }
};

// --- ACTUALIZAR UN SERVICIO (Admin/Dev) ---
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration_minutes, price, description } = req.body;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }

        // Actualizar campos
        service.name = name || service.name;
        service.duration_minutes = duration_minutes || service.duration_minutes;
        service.price = price || service.price;
        service.description = description || service.description;

        // Actualizar imagen solo si se envía una nueva
        if (req.file) {
            service.image_url = req.file.path;
        }

        await service.save();
        res.json(service);

    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error interno al actualizar el servicio.' });
    }
};

// --- ELIMINAR UN SERVICIO (Admin/Dev) ---
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Service.destroy({ where: { id } });

        if (deleted) {
            res.json({ message: 'Servicio eliminado correctamente.' });
        } else {
            res.status(404).json({ error: 'Servicio no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ error: 'Error interno al eliminar el servicio.' });
    }
};