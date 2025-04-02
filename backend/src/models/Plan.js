const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/db');
const User = require('./User');


const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    totalexpenses: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    },
    canceledAt: { 
        type: DataTypes.DATE, 
        allowNull: true // Stores when the plan was cancelled
    }
});

module.exports = Plan;