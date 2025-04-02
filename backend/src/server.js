require('dotenv').config();
const { sequelize, testDatabaseConnection } = require('./config/db');
const User = require('./models/User'); // Ensure User model is imported
const app = require('./app');

const PORT = process.env.PORT || 7788;

const startServer = async () => {
  try {
      await testDatabaseConnection();

      console.log("🔄 Fetching users from the database...");
      const users = await User.findAll();
      console.log(`✅ Found ${users.length} users in the database.`);

      app.listen(PORT, () => {
          console.log(`✅ Server running on http://localhost:${PORT}`);
      });
  } catch (error) {
      console.error("❌ Server failed to start:", error);
  }
};

// Start the server
startServer();