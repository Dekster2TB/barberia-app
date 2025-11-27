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
    // 👇 ESTE CAMPO ES LA ESPECIALIDAD
    specialty: {
        type: DataTypes.STRING,
        defaultValue: 'Estilista' // Valor por defecto si no pones nada
    },
    // 👇 ESTE CAMPO ES LA BIOGRAFÍA
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // 👇 ESTE CAMPO ES LA FOTO
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'barbers',
    timestamps: true
});

module.exports = Barber;