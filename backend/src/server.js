// Import and configure dotenv at the very top.
// We use path.resolve to ensure it correctly finds the .env file in the project root.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Now, the environment variables are loaded, so we can import the app.
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
