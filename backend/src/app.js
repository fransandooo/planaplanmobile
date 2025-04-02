const express = require("express");
const cors = require("cors");
const { checkCancelPlans } = require("./controllers/planController");

const app = express();
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const taskRoutes = require("./routes/taskRoutes");

// checkCancelPlans();

//CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // URL of the React app
  methods: "GET, POST, PUT, DELETE", // HTTP methods allowed
  allowedHeaders: "Content-Type, Authorization", // HTTP headers allowed
  credentials: true, // Enable cookies
};

app.use(cors(corsOptions));

//Middleware to parse JSON request body
app.use(express.json());

// Import routes
app.use("/api/auth", authRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/resp", taskRoutes);

//Default route to check if the server is running
app.get("/", (req, res) => {
  res.send("Plan A Plan API server is running");
});

module.exports = app;
