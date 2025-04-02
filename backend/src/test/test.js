const { sequelize } = require('../config/db');

const testSequelizeExport = async () => {
    try {
        console.log('Testing sequelize export...');
        await sequelize.authenticate();
        console.log('Sequelize instance is working correctly.');
    } catch (error) {
        console.error('Error testing sequelize export:', error);
    }
};

testSequelizeExport();