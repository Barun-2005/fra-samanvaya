const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend server is running and listening at http://${HOST}:${PORT}`);
});
