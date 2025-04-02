const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const certPath = path.resolve(__dirname, '../../certs/ca.pem');
const caCert = fs.readFileSync(certPath).toString();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        ca: caCert
      }
    }
  }
);

const testDatabaseConnection = async () => {
  console.log(`🟢 Connecting to database`);
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    require('../models/associations');
    await sequelize.sync({ alter: true });
    console.log('✅ Models have been synchronized with the database.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testDatabaseConnection };
