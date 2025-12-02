const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SiteConfig = sequelize.define('SiteConfig', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appName: { type: DataTypes.STRING, defaultValue: 'Barbería del Futuro' },
    footerText: { type: DataTypes.STRING, defaultValue: 'Reservas Online' },
    whatsappNumber: { type: DataTypes.STRING, defaultValue: '56900000000' },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
    // 1. AGREGAMOS ESTE CAMPO NUEVO PARA EL FONDO
    backgroundImageUrl: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'site_configs', timestamps: true });

module.exports = SiteConfig;