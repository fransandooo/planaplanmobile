const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/db');
const User = require('./User');
const Plan = require('./Plan');

const Participant = sequelize.define('Participant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    role: {
        type: DataTypes.STRING, //Example: 'organizer', 'participant'
        allowNull: false
    },
    status:
    {
        type: DataTypes.ENUM( 'pending', 'accepted', 'rejected' ),
        defaultValue: 'pending',
        allowNull: false
    },
    inviteToken: {
        type: DataTypes.STRING, //Stores the token that is sent to the user to join the plan
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE, //Stores the expiration date of the inviteToken
        allowNull: true
    },
    inviteLink: {
        type: DataTypes.STRING, //Stores the link that is sent to the user to join the plan
        allowNull: true
    }
});


module.exports = Participant;