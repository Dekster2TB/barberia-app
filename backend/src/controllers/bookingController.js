const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const { Op } = require('sequelize'); 

// Configuraciones
const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// 1. Obtener horarios disponibles
exports.getAvailability = async (req, res) => {
    // ... (tu código existente de disponibilidad)
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Se requiere date' });

        const reservations = await Reservation.findAll({
            where: { date, status: { [Op.not]: 'cancelled' } }
        });

        let allSlots = [];
        for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
            const hourString = h < 10 ? `0${h}` : `${h}`;
            allSlots.push(`${hourString}:00`);
            allSlots.push(`${hourString}:30`);
        }

        const availableSlots = allSlots.filter(slot => {
            const isBusy = reservations.some(r => String(r.start_time).startsWith(slot));
            return !isBusy; 
        });

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular disponibilidad' });
    }
};

// 2. Crear Reserva
exports.createReservation = async (req, res) => {
    // ... (tu código existente de crear)
    try {
        const { service_id, date, start_time, user_name, user_phone } = req.body;
        // Validaciones...
        const newReservation = await Reservation.create({
            service_id, date, start_time, 
            end_time: calculateEndTime(start_time),
            user_name, user_phone
        });
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear reserva' });
    }
};

// 3. Obtener TODAS las reservas (Admin)
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Reservation.findAll({
            include: Service, 
            order: [['date', 'ASC'], ['start_time', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

// 4. Actualizar estado (ESTA ES LA QUE TE FALTA O ESTÁ MAL EXPORTADA)
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
            const updatedBooking = await Reservation.findByPk(id, { include: Service });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'Reserva no encontrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// Función auxiliar (fuera de los exports)
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