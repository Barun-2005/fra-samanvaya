const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');

// --- THIS IS THE FIX ---
const PORT = process.env.PORT || 4000;
// --- END OF FIX ---
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend server is running and listening at http://${HOST}:${PORT}`);
});
