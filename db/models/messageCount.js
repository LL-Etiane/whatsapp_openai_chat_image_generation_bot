const { DataTypes } = require('sequelize');
const sequelize = require('../db.js')

MessageCount = sequelize.define('MessageCount', {
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    count: {
        type: DataTypes.INTEGER,
        default: 1,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        default: Date.now(),
        allowNull: false
    },
}, {});

sequelize.sync()

module.exports = MessageCount;