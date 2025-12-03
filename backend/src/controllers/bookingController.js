const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { Op } = require('sequelize'); 
const { sendConfirmationEmail } = require('../config/mailer');

// --- CONFIGURACIÓN ---
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

const calculateEndTime = (startTime, durationMinutes = 30) => {
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + durationMinutes;
    return minutesToTime(endMin);
};

// Obtener hora actual de Chile como objeto Date
const getChileDateObj = () => {
    const now = new Date();
    // Convertimos a string en zona horaria correcta
    const chileTimeStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
    return new Date(chileTimeStr);
};

// --- 1. DISPONIBILIDAD ---
exports.getAvailability = async (req, res) => {
    try {
        const { date, barber_id, service_id } = req.query;
        if (!date || !barber_id || !service_id) return res.status(400).json({ error: 'Faltan parámetros' });

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

        res.json(availableSlots.map(m => minutesToTime(m)));
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular' });
    }
};

// --- 2. CREAR RESERVA ---
exports.createReservation = async (req, res) => {
    try {
        const { service_id, barber_id, date, start_time, user_name, user_phone, user_email } = req.body;
        if (!service_id || !barber_id || !date || !start_time || !user_name || !user_phone) return res.status(400).json({ error: 'Faltan campos' });

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

        if (existing) return res.status(409).json({ error: 'Ocupado' });

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

// --- 3. ADMIN: GET BOOKINGS ---
exports.getBookings = async (req, res) => {
    try {
        const confirmedBookings = await Reservation.findAll({ where: { status: 'confirmed' } });
        
        // Lógica de auto-completado usando comparación de texto ISO (la que funcionó antes)
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'America/Santiago', hour12: false,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const parts = formatter.formatToParts(now);
        const get = (t) => parts.find(p => p.type === t).value;
        const nowChileStr = `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;

        const updates = confirmedBookings.map(async (booking) => {
            const bookingEndStr = `${booking.date} ${booking.end_time}`;
            if (nowChileStr > bookingEndStr) {
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

// --- 4. ADMIN: ACTUALIZAR ESTADO ---
exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [updated] = await Reservation.update({ status }, { where: { id } });
        if (updated) {
            const updatedBooking = await Reservation.findByPk(id, { include: [Service, Barber] });
            return res.json(updatedBooking);
        }
        return res.status(404).json({ error: 'No encontrada' });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
};

// --- 5. CLIENTE: MIS RESERVAS ---
exports.getClientBookings = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Teléfono requerido' });
    try {
        const bookings = await Reservation.findAll({
            where: { user_phone: phone },
            include: [Service, Barber], 
            order: [['createdAt', 'DESC']] 
        });
        res.json(bookings);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
};

// --- 6. CLIENTE: CANCELAR (CON RESTRICCIÓN DE 10 MIN) ---
exports.cancelClientBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Reservation.findByPk(id);
        if (!booking) return res.status(404).json({ error: 'No encontrada' });

        // --- VALIDACIÓN DE TIEMPO ---
        
        // 1. Hora actual en Chile
        const nowChile = getChileDateObj();
        
        // 2. Hora de la cita (Construimos objeto Date)
        // Ojo: Asumimos que booking.date es YYYY-MM-DD y start_time HH:mm:ss
        const bookingStart = new Date(`${booking.date}T${booking.start_time}`);

        // 3. Calculamos la diferencia en milisegundos
        const diffMs = bookingStart - nowChile;
        const diffMinutes = Math.floor(diffMs / 60000);

        console.log(`Cancelación: Faltan ${diffMinutes} minutos para la cita.`);

        // 4. Regla: No se puede cancelar si faltan 10 minutos o menos (o si ya pasó)
        if (diffMinutes <= 10) {
            return res.status(400).json({ 
                error: 'No se puede cancelar con menos de 10 minutos de anticipación.' 
            });
        }

        booking.status = 'cancelled';
        await booking.save();
        res.json({ message: 'Cancelada con éxito' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cancelar' });
    }
};