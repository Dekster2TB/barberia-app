const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Barber = sequelize.define('Barber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Podrías agregar 'avatar' aquí si quieres fotos
}, {
    tableName: 'barbers',
    timestamps: true
});

module.exports = Barber;