const express = require('express');
const {createPlan, inviteFriends, cancelPlan, getAllPlans, updatePlan, getIndividualPlan, getUserPlans, getPlanExpenses, respondToInvite, getPendingInvites} = require('../controllers/planController');

const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

//ROUTES - JWT REQUIRED
router.post('/create-plan', authenticateToken, createPlan);
router.post('/:planId/invite', authenticateToken, inviteFriends);
router.get('/invite/:inviteToken', respondToInvite);
router.get('/invitations', authenticateToken, getPendingInvites);
router.delete('/:planId/cancel', authenticateToken, cancelPlan);
router.get('/events', authenticateToken, getAllPlans);
router.get('/events/user', authenticateToken, getUserPlans);
router.get('/events/:planId', authenticateToken, getIndividualPlan);
router.put('/events/update/:planId', authenticateToken, updatePlan);
router.get('/plans/:planId/expenses', authenticateToken, getPlanExpenses);

module.exports = router;