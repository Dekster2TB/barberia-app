const Service = require('../models/Service');
const Barber = require('../models/Barber');

// --- SERVICIOS ---

// Crear un nuevo servicio
exports.createService = async (req, res) => {
    try {
        const { name, duration_minutes, price, description } = req.body;

        // 🛡️ VALIDACIÓN: Campos obligatorios
        if (!name || !duration_minutes || !price) {
            return res.status(400).json({ 
                error: 'Nombre, duración y precio son obligatorios.' 
            });
        }

        const image_url = req.file ? req.file.path : null;

        const newService = await Service.create({
            name,
            duration_minutes,
            price,
            description: description || '', // Opcional: si viene vacío, guardamos string vacío
            image_url
        });
        res.status(201).json(newService);
    } catch (error) {
        console.error('Error creando servicio:', error);
        // Manejo de error de duplicados (ej: nombre ya existe)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe un servicio con este nombre.' });
        }
        res.status(500).json({ error: 'Error interno al crear servicio.' });
    }
};

// Actualizar un servicio existente
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration_minutes, price, description } = req.body;
        
        // 🛡️ VALIDACIÓN: Campos obligatorios
        if (!name || !duration_minutes || !price) {
            return res.status(400).json({ 
                error: 'Nombre, duración y precio no pueden estar vacíos.' 
            });
        }

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Actualizar campos
        service.name = name;
        service.duration_minutes = duration_minutes;
        service.price = price;
        service.description = description || ''; // Opcional

        // Si hay nueva imagen, la actualizamos. Si no, dejamos la anterior.
        if (req.file) {
            service.image_url = req.file.path;
        }

        await service.save();
        res.json(service);

    } catch (error) {
        console.error('Error actualizando servicio:', error);
        res.status(500).json({ error: 'Error interno al actualizar servicio.' });
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
        res.status(500).json({ error: 'Error al eliminar servicio.' });
    }
};

// --- BARBEROS ---

// Crear un nuevo barbero
exports.createBarber = async (req, res) => {
    try {
        const { name, specialty, bio } = req.body;
        
        // Validación simple para barberos también
        if (!name) {
            return res.status(400).json({ error: 'El nombre del barbero es obligatorio.' });
        }

        const image_url = req.file ? req.file.path : null;

        const newBarber = await Barber.create({
            name,
            specialty: specialty || 'Estilista General',
            bio: bio || '',
            image_url
        });
        res.status(201).json(newBarber);
    } catch (error) {
        console.error('Error creando barbero:', error);
        res.status(500).json({ error: 'Error al crear barbero.' });
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
        res.status(500).json({ error: 'Error al eliminar barbero.' });
    }
};