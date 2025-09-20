const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/schemes', require('./routes/schemes'));

module.exports = app;
