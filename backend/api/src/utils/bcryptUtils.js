const bcrypt = require('bcrypt');

const saltRounds = 10; // Number of rounds to use when generating a salt



// Function to hash a password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};

// Function to compare a password with a hash
const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
    }
};

module.exports = { hashPassword, comparePassword };