const app = require('../../backend/src/app'); // adjust path to point to your app.js
const serverless = require('serverless-http');

module.exports = serverless(app);
