const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt'); // <--- NUEVA IMPORTACIÓN

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
    timestamps: true,
    // Aquí es donde definimos el comportamiento antes de crear
    hooks: { // <--- NUEVA SECCIÓN
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }
});

// Método auxiliar para comparar contraseñas durante el login
User.prototype.validPassword = function(password) {
    return bcrypt.compare(password, this.password);
}; // <--- NUEVO MÉTODO

module.exports = User;