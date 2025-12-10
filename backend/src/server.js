const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const { startSLAMonitor } = require('../scripts/slaMonitor');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend server is running and listening at http://${HOST}:${PORT}`);

  // Start SLA monitoring cron jobs
  startSLAMonitor();
});
