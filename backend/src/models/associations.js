const User = require("./User");
const Plan = require("./Plan");
const Participant = require("./Participant");
const Task = require("./Task");

// Define associations
User.hasMany(Plan, { foreignKey: "organizerId", as: "createdPlans" });
Plan.belongsTo(User, { foreignKey: "organizerId", as: "createdBy" });

User.hasMany(Participant, { foreignKey: "userId", as: "participations" });
Plan.hasMany(Participant, { foreignKey: "planId", as: "participants" });
Participant.belongsTo(Plan, { foreignKey: "planId", as: "plan" });
Participant.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Task, { foreignKey: "userId", as: "tasks" });
Plan.hasMany(Task, { foreignKey: "planId", as: "taskOwners" });
Task.belongsTo(Plan, { foreignKey: "planId", as: "plan" });
Task.belongsTo(User, { foreignKey: "userId", as: "user" });
