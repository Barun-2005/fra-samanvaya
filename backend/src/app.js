const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/documents', require('./routes/documents'));
// app.use('/api/assets', require('./routes/assets'));
// app.use('/api/schemes', require('./routes/schemes'));

module.exports = app;
