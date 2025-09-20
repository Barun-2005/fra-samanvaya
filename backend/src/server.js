// Import and configure dotenv at the very top.
// We use path.resolve to ensure it correctly finds the .env file in the project root.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Now, the environment variables are loaded, so we can import the app.
const app = require('./app');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'; // This is the crucial change

app.listen(PORT, HOST, () => {
  // Updated log message for clarity
  console.log(`✅ Backend server is running and listening at http://${HOST}:${PORT}`);
});
