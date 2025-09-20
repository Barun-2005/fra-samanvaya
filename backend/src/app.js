require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();

// ** FIX: Explicit CORS Configuration **
// We are telling the backend server to only accept requests
// from the frontend's development address.
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
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
