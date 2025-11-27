const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { Op } = require('sequelize'); 
const { sendConfirmationEmail } = require('../config/mailer');

// --- CONFIGURACIÓN DE HORARIO ---
const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// --- HELPERS DE TIEMPO ---
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// --- 1. DISPONIBILIDAD INTELIGENTE ---
exports.getAvailability = async (req, res) => {
    try {
        const { date, barber_id, service_id } = req.query;
        if (!date || !barber_id || !service_id) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        const service = await Service.findByPk(service_id);
        if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
        const step = service.duration_minutes; 

        const reservations = await Reservation.findAll({
            where: { date, barber_id, status: { [Op.not]: 'cancelled' } }
        });

        let possibleSlots = [];
        const startMinutes = WORK_START_HOUR * 60;
        const endMinutes = WORK_END_HOUR * 60;

        for (let time = startMinutes; time < endMinutes; time += step) {
            possibleSlots.push(time);
        }

        const availableSlots = possibleSlots.filter(slotStart => {
            const slotEnd = slotStart + step; 
            if (slotEnd > endMinutes) return false;

            const hasCollision = reservations.some(r => {
                const rStart = timeToMinutes(r.start_time);
                const rEnd = timeToMinutes(r.end_time);
                return (slotStart < rEnd && slotEnd > rStart);
            });
            return !hasCollision;
        });

        const formattedSlots = availableSlots.map(minutes => minutesToTime(minutes));
        res.json(formattedSlots);
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular disponibilidad' });
    }
};

// --- 2. CREAR RESERVA ---
exports.createReservation = async (req, res) => {
    try {
        const { service_id, barber_id, date, start_time, user_name, user_phone, user_email } = req.body;
        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos' });
        }

        const service = await Service.findByPk(service_id);
        if (!service) return res.status(404).json({ error: 'Servicio inválido' });
        
        const startMin = timeToMinutes(start_time);
        const endMin = startMin + service.duration_minutes;
        const end_time = minutesToTime(endMin);

        const existing = await Reservation.findOne({
            where: { 
                date, barber_id, status: { [Op.not]: 'cancelled' },
                [Op.or]: [{ start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } }]
            }
        });

        if (existing) return res.status(409).json({ error: 'Horario ocupado.' });

        const newReservation = await Reservation.create({
            service_id, barber_id, date, start_time, end_time,
            user_name, user_phone, user_email: user_email || null
        });

        if(user_email) {
            const barber = await Barber.findByPk(barber_id);
            sendConfirmationEmail(user_email, {
                user_name, serviceName: service.name, barberName: barber.name, date, start_time
            });
        }
        res.status(201).json(newReservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
};

// --- 3. OBTENER RESERVAS (ADMIN) + AUTO-COMPLETAR ---
exports.getBookings = async (req, res) => {
    try {
        const confirmedBookings = await Reservation.findAll({ where: { status: 'confirmed' } });
        
        // 1. OBTENER HORA ACTUAL UTC
        const now = new Date();
        
        // 2. RESTAR 3 HORAS PARA OBTENER HORA CHILE (Manual y seguro)
        // (Esto evita depender de configuraciones de servidor)
        const CHILE_OFFSET = 3 * 60 * 60 * 1000; 
        const nowChile = new Date(now.getTime() - CHILE_OFFSET);
        
        // Convertimos a string ISO comparable: "2025-11-27T14:51:00"
        const nowChileString = nowChile.toISOString().slice(0, 19);

        const updates = confirmedBookings.map(async (booking) => {
            // Construimos el string de fin de la cita: "2025-11-27T15:00:00"
            const bookingEndString = `${booking.date}T${booking.end_time}`;
            
            // Comparamos alfabéticamente (ISO lo permite)
            // "2025-11-27T14:51:00" > "2025-11-27T15:00:00" -> FALSO (No completa)
            if (nowChileString > bookingEndString) {
                booking.status = 'completed';
                return booking.save();
            }
        });
        
        await Promise.all(updates);

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

// ... (Las demás funciones updateBookingStatus, getClientBookings, cancelClientBooking siguen igual)
// Asegúrate de copiarlas del archivo anterior o mantenerlas abajo.
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
    } catch (error) { res.status(500).json({ error: 'Error' }); }
};

exports.getClientBookings = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Teléfono requerido' });
    try {
        const bookings = await Reservation.findAll({
            where: { user_phone: phone },
            include: [Service, Barber], 
            order: [['date', 'DESC'], ['start_time', 'ASC']]
        });
        res.json(bookings);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
};

exports.cancelClientBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Reservation.findByPk(id);
        if (!booking) return res.status(404).json({ error: 'No encontrada' });
        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'Cancelada' });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
};