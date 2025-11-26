const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { Op } = require('sequelize'); 
const { sendConfirmationEmail } = require('../config/mailer');

// --- CONFIGURACIÓN DE HORARIO ---
const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// --- 1. OBTENER DISPONIBILIDAD (PÚBLICO) ---
exports.getAvailability = async (req, res) => {
    try {
        const { date, barber_id } = req.query;

        if (!date || !barber_id) {
            return res.status(400).json({ error: 'Faltan parámetros: date y barber_id' });
        }

        // Buscar reservas existentes para ese barbero en esa fecha
        const reservations = await Reservation.findAll({
            where: {
                date: date,
                barber_id: barber_id, 
                status: { [Op.not]: 'cancelled' } 
            }
        });

        // Generar slots cada 30 min
        let allSlots = [];
        for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
            const hourString = h < 10 ? `0${h}` : `${h}`;
            allSlots.push(`${hourString}:00`);
            allSlots.push(`${hourString}:30`);
        }

        // Filtrar ocupados
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

// --- 2. CREAR RESERVA (PÚBLICO) ---
exports.createReservation = async (req, res) => {
    try {
        const { service_id, barber_id, date, start_time, user_name, user_phone, user_email } = req.body;

        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existing = await Reservation.findOne({
            where: { 
                date, start_time, barber_id, 
                status: { [Op.not]: 'cancelled' }
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Horario no disponible.' });
        }

        const newReservation = await Reservation.create({
            service_id, barber_id, date, start_time,
            end_time: calculateEndTime(start_time),
            user_name, user_phone,
            user_email: user_email || null
        });

        // Enviar Correo (si hay email)
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
        console.error('Error creando reserva:', error);
        res.status(500).json({ error: 'Error interno al crear la reserva' });
    }
};

// --- 3. OBTENER TODAS LAS RESERVAS (ADMIN) + AUTO-COMPLETAR ---
exports.getBookings = async (req, res) => {
    try {
        // 1. AUTO-COMPLETADO MÁGICO
        const confirmedBookings = await Reservation.findAll({
            where: { status: 'confirmed' }
        });

        const now = new Date();
        
        const updates = confirmedBookings.map(async (booking) => {
            // Crear fecha de fin de la reserva (YYYY-MM-DDTHH:mm)
            const bookingEnd = new Date(`${booking.date}T${booking.end_time}`);
            
            // Si la hora actual es mayor que el fin de la cita
            if (now > bookingEnd) {
                booking.status = 'completed';
                return booking.save();
            }
        });

        await Promise.all(updates);

        // 2. TRAER LISTA ACTUALIZADA
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

// --- 4. ACTUALIZAR ESTADO (ADMIN - PATCH) ---
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
            const updatedBooking = await Reservation.findByPk(id, { include: [Service, Barber] });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'Reserva no encontrada' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// --- 5. BUSCAR RESERVAS POR TELÉFONO (CLIENTE) ---
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
    } catch (error) {
        res.status(500).json({ error: 'Error buscando reservas' });
    }
};

// --- 6. CANCELAR RESERVA PROPIA (CLIENTE) ---
exports.cancelClientBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Reservation.findByPk(id);
        if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });
        
        booking.status = 'cancelled';
        await booking.save();
        
        res.json({ message: 'Cancelada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar' });
    }
};

// --- FUNCIÓN AUXILIAR ---
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