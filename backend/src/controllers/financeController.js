const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const Barber = require('../models/Barber'); // <--- Importamos el modelo Barbero
const { Op } = require('sequelize');
const sequelize = require('../config/db');

const COMISION_POR_RESERVA = 500; 

exports.getMonthlyStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        const now = new Date();
        const currentMonth = month ? parseInt(month) - 1 : now.getMonth(); 
        const currentYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        const bookings = await Reservation.findAll({
            where: {
                status: 'completed', 
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            // 👇 AQUI ESTÁ LA CLAVE: Incluimos también al Barbero
            include: [Service, Barber],
            order: [['date', 'DESC'], ['start_time', 'DESC']]
        });

        const totalBookings = bookings.length;
        
        const totalBarbershopIncome = bookings.reduce((sum, b) => {
            return sum + parseFloat(b.Service ? b.Service.price : 0);
        }, 0);

        const developerEarnings = totalBookings * COMISION_POR_RESERVA;

        res.json({
            period: { month: currentMonth + 1, year: currentYear },
            stats: {
                completed_bookings: totalBookings,
                barbershop_revenue: totalBarbershopIncome,
                developer_commission: developerEarnings,
                commission_rate: COMISION_POR_RESERVA
            },
            // 👇 Mapeamos los nuevos campos para el frontend
            details: bookings.map(b => ({
                id: b.id,
                date: b.date,
                time: b.start_time,
                client: b.user_name, // Nombre del Cliente
                barber: b.Barber ? b.Barber.name : 'Sin asignar', // Nombre del Barbero
                service: b.Service ? b.Service.name : 'N/A',
                price: b.Service ? b.Service.price : 0,
                commission: COMISION_POR_RESERVA
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error calculando finanzas' });
    }
};