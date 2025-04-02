const express = require('express');
const {registerUser, loginUser, getProfile, updateUserProfile, deleteUser} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

//PUBLIC ROUTES - NO JWT REQUIRED

//Route: POST /api/auth/register
router.post('/register', registerUser);

//Route: POST /api/auth/login
router.post('/login', loginUser);


//PRIVATE ROUTES - JWT REQUIRED
router.get('/profile', authenticateToken, getProfile);
router.put('/update-profile', authenticateToken, updateUserProfile);
router.delete('/delete-account', authenticateToken, deleteUser);


module.exports = router;
