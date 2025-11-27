const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { Op } = require('sequelize'); 
const { sendConfirmationEmail } = require('../config/mailer');

// --- CONFIGURACIÓN DE HORARIO ---
const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// --- HELPERS DE TIEMPO (Matemáticas de minutos) ---
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// --- 1. OBTENER DISPONIBILIDAD INTELIGENTE (PÚBLICO) ---
exports.getAvailability = async (req, res) => {
    try {
        // AHORA RECIBIMOS TAMBIÉN EL service_id PARA SABER LA DURACIÓN
        const { date, barber_id, service_id } = req.query;

        if (!date || !barber_id || !service_id) {
            return res.status(400).json({ error: 'Faltan parámetros: date, barber_id o service_id' });
        }

        // 1. Obtener la duración del servicio solicitado
        const service = await Service.findByPk(service_id);
        if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
        const serviceDuration = service.duration_minutes; // Ej: 60

        // 2. Obtener reservas existentes del barbero para ese día
        const reservations = await Reservation.findAll({
            where: {
                date: date,
                barber_id: barber_id, 
                status: { [Op.not]: 'cancelled' } 
            }
        });

        // 3. Generar slots base (cada 30 min)
        let possibleSlots = [];
        // Convertimos todo a minutos para calcular fácil
        const startMinutes = WORK_START_HOUR * 60;
        const endMinutes = WORK_END_HOUR * 60;
        const step = 30; // Intervalos de 30 min

        for (let time = startMinutes; time < endMinutes; time += step) {
            possibleSlots.push(time);
        }

        // 4. FILTRADO INTELIGENTE DE COLISIONES
        const availableSlots = possibleSlots.filter(slotStart => {
            const slotEnd = slotStart + serviceDuration;

            // Regla A: ¿El servicio termina después de la hora de cierre?
            if (slotEnd > endMinutes) return false;

            // Regla B: ¿Choca con alguna reserva existente?
            // Una colisión ocurre si: (StartA < EndB) y (EndA > StartB)
            const hasCollision = reservations.some(r => {
                const rStart = timeToMinutes(r.start_time);
                const rEnd = timeToMinutes(r.end_time);

                return (slotStart < rEnd && slotEnd > rStart);
            });

            return !hasCollision;
        });

        // 5. Convertir minutos de vuelta a formato "HH:mm"
        const formattedSlots = availableSlots.map(minutes => minutesToTime(minutes));

        res.json(formattedSlots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular disponibilidad' });
    }
};

// --- 2. CREAR RESERVA ---
exports.createReservation = async (req, res) => {
    try {
        const { service_id, barber_id, date, start_time, user_name, user_phone, user_email } = req.body;

        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Calcular hora de fin basada en la duración del servicio real
        const service = await Service.findByPk(service_id);
        if (!service) return res.status(404).json({ error: 'Servicio inválido' });
        
        const startMin = timeToMinutes(start_time);
        const endMin = startMin + service.duration_minutes;
        const end_time = minutesToTime(endMin);

        // Validación de duplicados (Doble chequeo de seguridad)
        const existing = await Reservation.findOne({
            where: { 
                date, 
                barber_id, 
                status: { [Op.not]: 'cancelled' },
                [Op.or]: [
                    // Lógica de colisión en SQL: (StartA < EndB AND EndA > StartB)
                    {
                        start_time: { [Op.lt]: end_time },
                        end_time: { [Op.gt]: start_time }
                    }
                ]
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'El horario ya fue ocupado por otra persona.' });
        }

        const newReservation = await Reservation.create({
            service_id, barber_id, date, start_time, end_time,
            user_name, user_phone, user_email: user_email || null
        });

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

// ... (Resto de funciones getBookings, updateBookingStatus, getClientBookings, cancelClientBooking IGUAL QUE ANTES) ...
// Copia las funciones restantes del archivo anterior aquí abajo para no perderlas.

// --- 3. OBTENER TODAS LAS RESERVAS (ADMIN) + AUTO-COMPLETAR ---
exports.getBookings = async (req, res) => {
    try {
        const confirmedBookings = await Reservation.findAll({ where: { status: 'confirmed' } });
        const now = new Date();
        const updates = confirmedBookings.map(async (booking) => {
            const bookingEnd = new Date(`${booking.date}T${booking.end_time}`);
            if (now > bookingEnd) {
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

exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
    try {
        const [updated] = await Reservation.update({ status }, { where: { id } });
        if (updated) {
            const updatedBooking = await Reservation.findByPk(id, { include: [Service, Barber] });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'Reserva no encontrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
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
    } catch (error) {
        res.status(500).json({ error: 'Error buscando reservas' });
    }
};

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