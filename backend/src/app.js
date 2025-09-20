const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();

// ** FIX: Public URL CORS Configuration **
const corsOptions = {
  origin: 'https://3000-firebase-fra-samanvaya-1758383690579.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/schemes', require('./routes/schemes'));

module.exports = app;
