const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { Op } = require('sequelize'); 
const { sendConfirmationEmail } = require('../config/mailer');

const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// 1. Disponibilidad
exports.getAvailability = async (req, res) => {
    try {
        const { date, barber_id } = req.query;
        if (!date || !barber_id) return res.status(400).json({ error: 'Faltan parámetros' });

        const reservations = await Reservation.findAll({
            where: { date, barber_id, status: { [Op.not]: 'cancelled' } }
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
        console.error("Error en availability:", error);
        res.status(500).json({ error: 'Error al calcular disponibilidad' });
    }
};

// 2. Crear Reserva
exports.createReservation = async (req, res) => {
    try {
        const { service_id, barber_id, date, start_time, user_name, user_phone, user_email } = req.body;

        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existing = await Reservation.findOne({
            where: { date, start_time, barber_id, status: { [Op.not]: 'cancelled' } }
        });

        if (existing) return res.status(409).json({ error: 'Horario ocupado.' });

        const newReservation = await Reservation.create({
            service_id, barber_id, date, start_time,
            end_time: calculateEndTime(start_time),
            user_name, user_phone,
            user_email: user_email || null
        });

        const service = await Service.findByPk(service_id);
        const barber = await Barber.findByPk(barber_id);
        
        if(user_email) {
            sendConfirmationEmail(user_email, {
                user_name,
                serviceName: service.name,
                barberName: barber.name,
                date,
                start_time
            });
        }
        res.status(201).json(newReservation);
    } catch (error) {
        console.error("Error creando reserva:", error);
        res.status(500).json({ error: 'Error interno al crear la reserva' });
    }
};

// 3. Obtener Reservas (Admin)
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Reservation.findAll({
            include: [Service, Barber], 
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
    try {
        const [updated] = await Reservation.update({ status }, { where: { id } });
        if (updated) {
            const updatedBooking = await Reservation.findByPk(id, { include: [Service, Barber] });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'Reserva no encontrada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// 5. BUSCAR RESERVAS POR TELÉFONO (CLIENTE) - Esta es la que fallaba
exports.getClientBookings = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Teléfono requerido para buscar' });

    try {
        console.log(`🔍 Buscando reservas para: ${phone}`);

        const bookings = await Reservation.findAll({
            where: { user_phone: phone },
            include: [Service, Barber], 
            order: [['date', 'DESC'], ['start_time', 'ASC']]
        });
        
        console.log(`✅ Encontradas: ${bookings.length}`);
        res.json(bookings);

    } catch (error) {
        console.error("❌ ERROR CRÍTICO AL BUSCAR MIS RESERVAS:", error);
        res.status(500).json({ error: 'Error buscando reservas', details: error.message });
    }
};

// 6. Cancelar Reserva Propia (Cliente)
exports.cancelClientBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Reservation.findByPk(id);
        if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });
        
        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'Reserva cancelada exitosamente' });
    } catch (error) {
        console.error("Error cancelando:", error);
        res.status(500).json({ error: 'Error al cancelar la reserva' });
    }
};

function calculateEndTime(startTime) {
    const [hour, minute] = startTime.split(':').map(Number);
    let newMinute = minute + 30;
    let newHour = hour;
    if (newMinute >= 60) { newMinute -= 60; newHour += 1; }
    const finalHour = newHour < 10 ? `0${newHour}` : `${newHour}`;
    return `${finalHour}:${newMinute === 0 ? '00' : newMinute}`;
}