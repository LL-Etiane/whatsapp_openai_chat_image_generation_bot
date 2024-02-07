const { DataTypes } = require('sequelize');
const sequelize = require('../db.js')

const User = sequelize.define('Users', {
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAllowed: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        default: false,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        default: Date.now(),
        allowNull: false
    },
}, {});

module.exports = User;