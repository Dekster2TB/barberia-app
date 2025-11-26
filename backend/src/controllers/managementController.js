const Service = require('../models/Service');
const Barber = require('../models/Barber');

// --- GESTIÓN DE SERVICIOS ---

// Crear un nuevo servicio con imagen
exports.createService = async (req, res) => {
    try {
        const { name, duration_minutes, price, description } = req.body;
        
        // Si Cloudinary procesó la imagen, la URL estará en req.file.path
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
        console.error('Error creando servicio:', error);
        res.status(500).json({ error: 'Error al crear el servicio. Verifica los datos.' });
    }
};

// Eliminar un servicio
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
        console.error('Error eliminando servicio:', error);
        res.status(500).json({ error: 'Error al eliminar el servicio.' });
    }
};

// --- GESTIÓN DE BARBEROS ---

// Crear un nuevo barbero con foto
exports.createBarber = async (req, res) => {
    try {
        const { name, specialty, bio } = req.body;
        const image_url = req.file ? req.file.path : null;

        const newBarber = await Barber.create({
            name,
            specialty,
            bio,
            image_url
        });

        res.status(201).json(newBarber);
    } catch (error) {
        console.error('Error creando barbero:', error);
        res.status(500).json({ error: 'Error al crear el barbero.' });
    }
};

// Eliminar un barbero
exports.deleteBarber = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Barber.destroy({ where: { id } });

        if (deleted) {
            res.json({ message: 'Barbero eliminado correctamente.' });
        } else {
            res.status(404).json({ error: 'Barbero no encontrado.' });
        }
    } catch (error) {
        console.error('Error eliminando barbero:', error);
        // Aquí podrías validar si tiene reservas activas antes de borrar
        res.status(500).json({ error: 'Error al eliminar el barbero.' });
    }
};