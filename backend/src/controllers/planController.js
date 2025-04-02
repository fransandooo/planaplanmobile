const Plan = require('../models/Plan');
const User = require('../models/User');
const Participant = require('../models/Participant');
const crypto = require('crypto');
const { Op } = require('sequelize'); // Import Sequelize operators for filtering (such as less than etc)

//Function to create a plan
const createPlan = async (req, res) => {
    try {
        const { name, description, totalexpenses, date, location } = req.body;
        const organizerId = req.user.id;


        // Check if all fields are provided
        if (!name || !description || !totalexpenses || !date || !location) {
            return res.status(400).json({ message: "All fields are required." });
        }

        //Check for duplicate plan name for the same organizer
        const existingPlan = await Plan.findOne({ where: { name, organizerId } });
        if (existingPlan) {
            return res.status(400).json({ message: "You already have a plan with that name." });
        }

        // Create a new plan
        const newPlan = await Plan.create({
            name,
            description,
            totalexpenses,
            date,
            location,
            organizerId //Link the plan to the user who created it
        });

        //Add the organizer as a participant
        await Participant.create({
            planId: newPlan.id,
            userId: organizerId,
            role: 'organizer',
            status: 'accepted'
        });


        res.status(201).json({ message: "Plan created successfully!", plan: newPlan });

    } catch (error) {
        console.error("❌ Error in creating plan:", error);
        res.status(500).json({ message: error.message });
    }
};



//Function to invite users to a plan
const inviteFriends = async (req, res) => {
    try{

        const {emails} = req.body;
        const {planId} = req.params;
        const userId = req.user.id;

        //Validate Input
        if(!emails){
            return res.status(400).json({message: "All fields are required."});
            
        }

        //Check if the user is the organizer of the plan and the plan exists
        const plan = await Plan.findOne({where: {id: planId, organizerId: userId}});
        if(!plan){
            return res.status(404).json({message: "Plan not found or authorized."});
        }

        //Check if the user exists
        const invite = await User.findOne({where: {email: emails}});
        if(!invite){
            return res.status(404).json({message: "User not found."});
        }

        //Check if the user is already a participant 
        const existingParticipants = await Participant.findOne({where: {planId, userId: invite.id}});
        if(existingParticipants){
            return res.status(400).json({message: "User is already a participant."});
        }

        //Create unique token for the invitation
        const inviteToken = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); //Set expiration date to 24 hours

           //Generate invitation link
           const inviteLink = 'http://localhost:7788/api/plan/invite/' + inviteToken;

        //Create a new participant
        const newParticipant = await Participant.create({
            planId,
            userId: invite.id,
            role: 'participant',
            status: 'pending',
            inviteToken,
            expiresAt,
            inviteLink: inviteLink
        });

        res.status(200).json({message: "Invitation sent successfully!", participant: newParticipant});

    }catch(error){
        console.error("❌ Error in inviting friends:", error);
        res.status(500).json({message: error.message});
    }
};

const respondToInvite = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const {status} = req.query; // Get the status from the query parameters

        //Validate response status
        if(!['accepted', 'rejected'].includes(status)){
            return res.status(400).json({message: "Invalid response status. Must be 'accepted' or 'rejected'."});
        }

        //Finds the participant with the token
        const participant = await Participant.findOne({ where: { inviteToken } });
        if (!participant) {
            return res.status(404).json({ message: "Invitation not found." });
        }

        //Check if the invitation has expired
        const currentDate = new Date();
        if (participant.expiresAt && participant.expiresAt < currentDate) {
            return res.status(400).json({ message: "Invitation has expired." });
        }

        //Update the participant status based on the response
        participant.status = status;
        participant.inviteToken = null; // Remove the invite token
        participant.expiresAt = null; // Remove the expiration date
        participant.inviteLink = null; // Remove the invite link
        await participant.save();

        res.status(200).json({
            message: `Invitation ${status} successfully!`,
            participant
        });

    } catch (error) {
        console.error("❌ Error in responding to invite:", error);
        res.status(500).json({ message: error.message });
    }
};

const getPendingInvites = async (req, res) => {
    try {
      const userId = req.user.id
      const invitations = await Participant.findAll({
        where: {
          userId,
          status: 'pending'
        },
        include: {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'date', 'location']
        }
      })
  
      res.status(200).json({ invitations })
    } catch (error) {
      console.error("Error fetching invitations:", error)
      res.status(500).json({ message: "Error retrieving invitations." })
    }
};
  


// Function to cancel a plan (this is just a "soft deletion", we will only modify the status of the plan from "active" to "cancelled", not removing it from the databse)
const cancelPlan = async (req, res) => {
    try {
        const { planId } = req.params; // here we are getting the plan id from the URL parammeters
        const userId = req.user.id; // here we are getting the user id from the token

        // Check if the plan exists and if the user is the organizer of the plan (only the organizer can cancel the plan)
        const plan = await Plan.findOne({ where: { id: planId, organizerId: userId } });
        if (!plan) {
            return res.status(404).json({ message: "Plan not found or authorized." });
        }

        // Update the plan status from "active" to "cancelled"
        plan.status = "cancelled";
        plan.canceledAt = new Date(); // Store the current timestamp in the "canceledAt" field
        await plan.save(); // save the changes in the database

        res.status(200).json({ message: "Plan cancelled successfully!", plan }); //success message with the updated plan

    } catch (error) {
        console.error("Error in cancelling plan:", error);
        res.status(500).json({ message: error.message });
    }
};

const checkCancelPlans = async () => {
    try {
        const expirationDate = new Date(); // We get the current time
        expirationDate.setMinutes(expirationDate.getMinutes() - 1); // We go back 1 minute (plans older than this will be deleted)

        // Find and delete plans that were cancelled more than 1 minute ago
        const deletedPlans = await Plan.destroy({
            where: {
                status: 'cancelled', // Only check plans marked as "cancelled"
                canceledAt: { [Op.lt]: expirationDate } // If canceledAt is older than 1 minute, we delete it from the database
            }
        });

        if (deletedPlans > 0) {
            console.log(`🗑️ Deleted ${deletedPlans} expired canceled plans.`); // Log to show how many plans were deleted
        }
    } catch (error) {
        console.error("❌ Error in deleting expired canceled plans:", error);
    }
};

// Function to get all plans with details, including attendees
const getAllPlans = async (req, res) => {
    try {
        // Fetch all plans from the database, including their details and attendees
        const plans = await Plan.findAll({
            attributes: ['id', 'name', 'description', 'date', 'location', 'status'], 
            include: [
                {
                    model: Participant, // We will get the participants of each plan
                    as: 'participants',
                    attributes: ['id', 'role'], // Include participant ID and role in the plan
                    include: {
                        model: User, // Now we get user details of each participant
                        as: 'user',
                        attributes: ['id', 'name', 'email'] // Only fetching user ID, name, and email
                    }
                },
                {
                    model: User, // Get the creator (organizer) of the plan
                    as: 'createdBy',
                    attributes: ['id', 'name', 'email'] // Include only organizer's ID, name, and email
                }
            ]
        });

        // --> Successfully retrieved plans, send response back
        res.status(200).json({ message: "Plans retrieved successfully", plans });
    } catch (error) {
        console.error("❌ Error retrieving plans:", error);
        res.status(500).json({ message: "Internal server error" })
    }
};

const getUserPlans = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("User found" + user.id);

        // Find all plans where the user is the organizer
        const plans = await Plan.findAll({
            where: { organizerId: user.id },
            attributes: ['id', 'name', 'description', 'date', 'location', 'status']
        });

        // Find all plans where the user is a participant and append to the plans array
        const participantPlans = await Participant.findAll({
            where: { userId: user.id, status: 'accepted' },
            attributes: ['planId', 'role'],
            include: {
                model: Plan,
                attributes: ['id', 'name', 'description', 'date', 'location', 'status'],
                as: 'plan' // Corrected alias
            }
        });

        participantPlans.forEach(participantPlan => {

            // Check if the plan is already in the array
            const existingPlan = plans.find(plan => plan.id === participantPlan.plan.id);
            if (existingPlan) return;

            plans.push(participantPlan.plan); // Corrected alias
        });

        res.status(200).json({ message: "User plans retrieved successfully.", plans });

    } catch (error) {
        console.error("❌ Error in fetching user plans:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getIndividualPlan = async (req, res) => {
    try {
        const { planId } = req.params; // Get the plan ID from the URL parameters

        // Fetch the plan from the database by its ID, including its details and attendees
        const plan = await Plan.findOne({
            where: { id: planId },
            attributes: ['id', 'name', 'description', 'date', 'location', 'status'],
            include: [
                {
                    model: Participant, // Get the participants of the plan
                    as: 'participants',
                    attributes: ['id', 'role'], // Include participant ID and role in the plan
                    include: {
                        model: User, // Get user details of each participant
                        as: 'user',
                        attributes: ['id', 'name', 'email'] // Only fetching user ID, name, and email
                    }
                },
                {
                    model: User, // Get the creator (organizer) of the plan
                    as: 'createdBy',
                    attributes: ['id', 'name', 'email'] // Include only organizer's ID, name, and email
                }
            ]
        });

        if (!plan) {
            return res.status(404).json({ message: "Plan not found." });
        }

        // Successfully retrieved the plan, send response back
        res.status(200).json({ message: "Plan retrieved successfully", plan });
    } catch (error) {
        console.error("❌ Error retrieving plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { planId } = req.params; // Get the plan ID from the URL parameters
        const { name, description, date, location, totalexpenses } = req.body; // Get the fields to update from the request body
        const userId = req.user.id; // Get the user ID from the token

        // Check if the plan exists and if the user is the organizer of the plan
        const plan = await Plan.findOne({ where: { id: planId, organizerId: userId } });
        if (!plan) {
            return res.status(404).json({ message: "Plan not found or authorized." });
        }

        // Update only the provided fields
        if (name) plan.name = name;
        if (description) plan.description = description;
        if (date) plan.date = date;
        if (location) plan.location = location;
        if (totalexpenses) plan.totalexpenses = totalexpenses;

        await plan.save(); // Save the changes in the database

        res.status(200).json({ message: "Plan updated successfully!", plan }); // Success message with the updated plan
    } catch (error) {
        console.error("❌ Error in updating plan:", error);
        res.status(500).json({ message: error.message });
    }
};

const getPlanExpenses = async (req, res) => {
    try {
        const { planId } = req.params;

        const plan = await Plan.findOne({
            where: { id: planId },
            attributes: ['id', 'name', 'totalexpenses'], // Fetch total expenses of the plan
            include: [
                {
                    model: Participant,
                    as: 'participants',
                    attributes: ['id'],
                    include: {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name']
                    }
                }
            ]
        });

        if (!plan) {
            return res.status(404).json({ message: "Plan not found." });
        }

        const totalExpenses = plan.totalexpenses;
        const participants = plan.participants;

        if (participants.length === 0) {
            return res.status(400).json({ message: "No participants found for this plan." });
        }

        // Calculate the distributed cost per participant
        const costPerParticipant = totalExpenses / participants.length;

        // Prepare the response with each participant's share
        const expenses = participants.map(participant => ({
            userId: participant.user.id,
            name: participant.user.name,
            amountOwed: costPerParticipant
        }));

        res.status(200).json({
            message: "Expenses calculated successfully.",
            planId: plan.id,
            planName: plan.name,
            totalExpenses,
            expenses
        });
    } catch (error) {
        console.error("❌ Error in calculating plan expenses:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


module.exports = {
    createPlan,
    inviteFriends,
    cancelPlan,
    checkCancelPlans,
    getAllPlans,
    getUserPlans,
    getIndividualPlan,
    updatePlan,
    getPlanExpenses,
    respondToInvite,
    getPendingInvites

};