const Plan = require("../models/Plan");
const User = require("../models/User");
const Participant = require("../models/Participant");
const Task = require("../models/Task");
const { Op } = require("sequelize"); // Import Sequelize operators for filtering (such as less than etc)

//Function to create a task
const assignTaskToParticipant = async (req, res) => {
  try {
    const { userId, task, cost } = req.body;
    const planId = req.params.planId;

    // Check if all fields are provided
    if (!userId || !task) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate that participant exists in the plan
    const participant = await Participant.findOne({
      where: { userId: userId, planId: planId },
    });
    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    // Validate that the task is not already assigned to the same participant
    const existingTask = await Task.findOne({
      where: { userId, planId, task },
    });
    if (existingTask) {
      return res.status(400).json({
        message: "Task already assigned to the participant.",
      });
    }

    // Create a new task
    const newTask = await Task.create({
      planId,
      userId,
      task,
      cost,
      status: "assigned",
    });

    res.status(201).json({
      message: "Task assigned successfully!",
      task: newTask,
    });
  } catch (error) {
    console.error("❌ Error in assigning task:", error);
    res.status(500).json({ message: error.message });
  }
};

//Function to pick the task as a participant
const pickTaskAsParticipant = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { taskId } = req.body;
    const { planId } = req.params;

    //Validate Input
    if (!taskId || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate that the plan exists
    const plan = await Plan.findOne({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    // Validate that the task exists and is available
    const task = await Task.findOne({
      where: { id: taskId },
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    if (task.status !== "available") {
      return res.status(400).json({ message: "Task is not available." });
    }

    // Validate that the user exists
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the task with the userId
    task.userId = userId;
    task.status = "assigned";
    await task.save();

    res.status(200).json({
      message: "Task picked!",
      task: task,
    });
  } catch (error) {
    console.error("❌ Error in picking task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Funcion to create a list of tasks for a plan
const createListOfTasksForPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { tasks } = req.body;

    // Check if all fields are provided
    if (!tasks) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate that the plan exists
    const plan = await Plan.findOne({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    // Validate that the tasks is a non-empty array of strings
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res
        .status(400)
        .json({ message: "Tasks should be a non-empty array." });
    }

    // Create tasks for the plan
    const createdTasks = await Task.bulkCreate(
      tasks.map((task) => ({
        planId,
        userId: null,
        task,
        status: "available",
      }))
    );

    res.status(200).json({
      message: "Tasks created successfully!",
      createdTasks,
    });
  } catch (error) {
    console.error("❌ Error creating tasks:", error);
    res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id; // from auth middleware

    const task = await Task.findOne({ where: { id: taskId, userId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found or not assigned to you." });
    }

    task.status = "completed";
    await task.save();

    res.status(200).json({ message: "Task marked as completed.", task });
  } catch (error) {
    console.error("❌ Error marking task as completed:", error);
    res.status(500).json({ message: error.message });
  }
};


const getAllTasksForPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const tasks = await Task.findAll({
      where: { planId },
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: error.message });
  }
};


const getTasksAssignedToUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.findAll({
      where: {
        userId,
      },
      include: {
        model: Plan,
        as: "plan",
        attributes: ["id", "name", "date", "location"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("❌ Error fetching user tasks:", error);
    res.status(500).json({ message: "Error retrieving user tasks." });
  }
};




module.exports = {
  assignTaskToParticipant,
  pickTaskAsParticipant,
  createListOfTasksForPlan,
  completeTask,
  getAllTasksForPlan,
  getTasksAssignedToUser,
};
