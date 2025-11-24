const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'barber'),
        defaultValue: 'barber',
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true
});

// Importante: En un paso posterior, debes implementar el hashing de la contraseña
// usando una librería como bcrypt antes de guardar el usuario.

module.exports = User;