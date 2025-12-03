const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SiteConfig = sequelize.define('SiteConfig', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appName: { type: DataTypes.STRING, defaultValue: 'Mi Barbería' }, 
    welcomeTitle: { type: DataTypes.STRING, defaultValue: 'Reserva tu Cita' }, 
    footerText: { type: DataTypes.STRING, defaultValue: 'Reservas Online' },
    whatsappNumber: { type: DataTypes.STRING, defaultValue: '56900000000' },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
    
    // 1. NUEVO CAMPO: Altura del Logo (en píxeles)
    logoHeight: { type: DataTypes.INTEGER, defaultValue: 75 }, 

    backgroundImageUrl: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'site_configs', timestamps: true });

module.exports = SiteConfig;