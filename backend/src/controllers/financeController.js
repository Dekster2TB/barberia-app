const Reservation = require('../models/Reservation');
const Service = require('../models/Service');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Configuración de tu comisión
const COMISION_POR_RESERVA = 500; // $500 pesos por cita

exports.getMonthlyStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Si no envían fecha, usar mes actual
        const now = new Date();
        const currentMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS months 0-11
        const currentYear = year ? parseInt(year) : now.getFullYear();

        // Definir rango de fechas (Primer y último día del mes)
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        // Buscar reservas COMPLETADAS en ese rango
        // Solo cobras por lo que realmente se atendió (completed)
        const bookings = await Reservation.findAll({
            where: {
                status: 'completed',
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [Service]
        });

        // Cálculos
        const totalBookings = bookings.length;
        
        // Ingreso total de la barbería (Suma de los precios de servicios)
        const totalBarbershopIncome = bookings.reduce((sum, booking) => {
            return sum + parseFloat(booking.Service ? booking.Service.price : 0);
        }, 0);

        // Tu ganancia
        const developerEarnings = totalBookings * COMISION_POR_RESERVA;

        res.json({
            period: {
                month: currentMonth + 1,
                year: currentYear
            },
            stats: {
                completed_bookings: totalBookings,
                barbershop_revenue: totalBarbershopIncome,
                developer_commission: developerEarnings,
                commission_rate: COMISION_POR_RESERVA
            },
            // Opcional: Detalle día a día para gráficos
            details: bookings.map(b => ({
                date: b.date,
                service: b.Service.name,
                price: b.Service.price,
                commission: COMISION_POR_RESERVA
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error calculando finanzas' });
    }
};