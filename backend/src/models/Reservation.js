const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // 👇 AGREGAMOS ESTO MANUALMENTE PARA ASEGURAR QUE LA COLUMNA EXISTA
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // ------------------------------------------------------------------
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    user_email: {
        type: DataTypes.STRING,
        allowNull: true // Opcional como pediste
    },

    user_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'confirmed',
        allowNull: false
    }
}, {
    tableName: 'reservations',
    timestamps: true
});

module.exports = Reservation;