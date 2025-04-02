const User = require('../models/User');
const { sendConfirmationEmail } = require('../service/emailService');
const { hashPassword, comparePassword } = require('../utils/bcryptUtils');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'PepeComePipas'; // Secret key for JWT signing and encryption

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !surname || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = await User.create({
            name,
            surname,
            email,
            password: hashedPassword
        });

        //await sendConfirmationEmail(email);


        res.status(201).json({ message: "User registered successfully!", user: { id: newUser.id, email: newUser.email } });
    } catch (error) {
        console.error("❌ Error in user registration:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        // Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Compare the password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password." });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        console.error("❌ Error in user login:", error);
        res.status(500).json({ message: "Internal server error." });
    }


};


//Fetch authenticated user profile
const getProfile = async (req, res) => {
    try {
        
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User profile retrieved successfully.", user });

    } catch (error) {
        console.error("❌ Error in fetching user profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


//Update authenticated user profile
const updateUserProfile = async (req, res) => {
    try{
        const {name, surname, email, password} = req.body;
        const userId = req.user.id;

        //Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        //Update only the fields that were provided
        if (name) user.name = name;
        if (surname) user.surname = surname;
        if (email) user.email = email;
        if (password) user.password = await hashPassword(password); //Hash the new password

        await user.save();

        res.status(200).json({ message: "User profile updated successfully.", user: { id: user.id, email: user.email } });
    }catch (error) {
        console.error("❌ Error in updating user profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

//Delete authenticated user account
const deleteUser = async (req, res) => {
    try{
        const userId = req.user.id;

        //Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        await user.destroy();
        res.status(200).json({ message: "User account deleted successfully." });
    }catch (error) {
        console.error("❌ Error in deleting user account:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}


module.exports = { registerUser, loginUser, getProfile, updateUserProfile, deleteUser };
