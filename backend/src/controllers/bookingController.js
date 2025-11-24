// --- IMPORTACIONES CRÍTICAS ---
const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
// 👇 ESTA LÍNEA ES LA QUE SUELE FALTAR Y CAUSA EL ERROR 500
const { Op } = require('sequelize'); 

// Configuraciones (puedes moverlas a un archivo de config luego)
const WORK_START_HOUR = 10; 
const WORK_END_HOUR = 19;   

// 1. Obtener horarios disponibles
exports.getAvailability = async (req, res) => {
    try {
        const { date } = req.query; 

        // Validación básica
        if (!date) {
            return res.status(400).json({ error: 'Se requiere el parámetro date (YYYY-MM-DD)' });
        }

        console.log(`🔍 Buscando disponibilidad para fecha: ${date}`);

        // A. Buscar reservas en la DB
        const reservations = await Reservation.findAll({
            where: {
                date: date,
                status: { [Op.not]: 'cancelled' } // <--- Aquí fallaba si no importabas Op
            }
        });

        console.log(`📅 Reservas encontradas: ${reservations.length}`);

        // B. Generar slots (10:00, 10:30, etc.)
        let allSlots = [];
        for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
            // Formateamos la hora para que siempre tenga 2 dígitos (ej: "09:00" en vez de "9:00")
            const hourString = h < 10 ? `0${h}` : `${h}`;
            allSlots.push(`${hourString}:00`);
            allSlots.push(`${hourString}:30`);
        }

        // C. Filtrar ocupados
        const availableSlots = allSlots.filter(slot => {
            const isBusy = reservations.some(r => {
                // Aseguramos que start_time sea tratado como string
                // Postgres devuelve "10:30:00", por eso usamos startsWith("10:30")
                return String(r.start_time).startsWith(slot);
            });
            return !isBusy; 
        });

        res.json(availableSlots);

    } catch (error) {
        // 👇 ESTO IMPRIMIRÁ EL ERROR REAL EN TU TERMINAL
        console.error("❌ ERROR CRÍTICO EN GET AVAILABILITY:", error);
        res.status(500).json({ 
            error: 'Error al calcular disponibilidad',
            details: error.message // Enviamos el detalle para que lo veas en Insomnia
        });
    }
};

// 2. Crear Reserva
exports.createReservation = async (req, res) => {
    try {
        const { service_id, date, start_time, user_name, user_phone } = req.body;

        if (!service_id || !date || !start_time || !user_name || !user_phone) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Validación de duplicados
        const existing = await Reservation.findOne({
            where: { 
                date, 
                start_time,
                status: { [Op.not]: 'cancelled' }
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Horario ocupado' });
        }

        // Crear
        const newReservation = await Reservation.create({
            service_id,
            date,
            start_time,
            end_time: calculateEndTime(start_time),
            user_name,
            user_phone
        });

        res.status(201).json(newReservation);

    } catch (error) {
        console.error("❌ ERROR AL CREAR RESERVA:", error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

// 3. Obtener TODAS las reservas (Para el Admin)
exports.getBookings = async (req, res) => {
    try {
        // Truco Senior: Usamos "include" para que traiga el nombre del servicio
        // en vez de solo el número ID.
        const bookings = await Reservation.findAll({
            include: Service, 
            order: [['date', 'ASC'], ['start_time', 'ASC']] // Ordenar por fecha
        });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};


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