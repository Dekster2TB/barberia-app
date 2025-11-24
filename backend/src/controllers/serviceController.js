const Service = require('../models/Service');

// 1. Obtener todos los servicios
exports.getServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};

// 2. Crear un nuevo servicio
exports.createService = async (req, res) => {
    try {
        // Extraemos los datos que nos envía el frontend (o Postman)
        const { name, duration_minutes, price } = req.body;

        // Validación básica (Brutalmente honesto: sin esto, tu DB se llena de basura)
        if (!name || !duration_minutes || !price) {
            return res.status(400).json({ error: 'Faltan datos: name, duration_minutes o price' });
        }

        // Crear en la DB
        const newService = await Service.create({
            name,
            duration_minutes,
            price
        });

        res.status(201).json(newService);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
};