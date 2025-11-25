const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber'); // <--- Importante: Modelo Barbero
const { Op } = require('sequelize'); 

const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// 1. Obtener horarios disponibles (FILTRADO POR BARBERO)
exports.getAvailability = async (req, res) => {
    try {
        const { date, barber_id } = req.query; // <-- Ahora pedimos barber_id obligatoriamente

        if (!date || !barber_id) {
            return res.status(400).json({ error: 'Faltan parámetros: date y barber_id' });
        }

        // Buscar reservas SOLO de ese barbero en esa fecha
        const reservations = await Reservation.findAll({
            where: {
                date: date,
                barber_id: barber_id, // <-- Filtro clave: Solo miramos la agenda de este barbero
                status: { [Op.not]: 'cancelled' } 
            }
        });

        // Generar todos los slots del día
        let allSlots = [];
        for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
            const hourString = h < 10 ? `0${h}` : `${h}`;
            allSlots.push(`${hourString}:00`);
            allSlots.push(`${hourString}:30`);
        }

        // Filtrar: Quitar los slots ocupados POR ESTE BARBERO
        const availableSlots = allSlots.filter(slot => {
            const isBusy = reservations.some(r => String(r.start_time).startsWith(slot));
            return !isBusy; 
        });

        res.json(availableSlots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular disponibilidad' });
    }
};

// 2. Crear Reserva (CON BARBERO)
exports.createReservation = async (req, res) => {
    try {
        // Recibimos barber_id del frontend
        const { service_id, barber_id, date, start_time, user_name, user_phone } = req.body;

        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Verificar duplicados SOLO para ese barbero
        // (Si Juan está ocupado, Ana podría estar libre a la misma hora)
        const existing = await Reservation.findOne({
            where: { 
                date, 
                start_time,
                barber_id, // <-- Verificamos la agenda del barbero específico
                status: { [Op.not]: 'cancelled' }
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Este barbero ya está ocupado a esa hora.' });
        }

        // Crear la reserva asignada
        const newReservation = await Reservation.create({
            service_id,
            barber_id, // <-- Guardamos quién atiende
            date,
            start_time,
            end_time: calculateEndTime(start_time),
            user_name,
            user_phone
        });

        res.status(201).json(newReservation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

// 3. Obtener Reservas (Admin) - Incluyendo nombre del Barbero y Servicio
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Reservation.findAll({
            include: [Service, Barber], // <-- JOIN doble: Traer datos de Servicio y Barbero
            order: [['date', 'ASC'], ['start_time', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

// 4. Actualizar Estado (Admin)
exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const [updated] = await Reservation.update({ status }, { where: { id } });

        if (updated) {
            // Devolver la reserva actualizada con sus relaciones para actualizar la tabla
            const updatedBooking = await Reservation.findByPk(id, { include: [Service, Barber] });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'Reserva no encontrada' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// Función auxiliar para calcular hora de fin
function calculateEndTime(startTime) {
    const [hour, minute] = startTime.split(':').map(Number);
    let newMinute = minute + 30;
    let newHour = hour;
    if (newMinute >= 60) {
        newMinute -= 60;
        newHour += 1;
    }
    const finalHour = newHour < 10 ? `0${newHour}` : `${newHour}`;
    return `${finalHour}:${newMinute === 0 ? '00' : newMinute}`;
}