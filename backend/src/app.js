const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();

// --- THIS IS THE FIX ---
app.use(cookieParser()); // Use cookie-parser middleware
// --- END OF FIX ---

app.use(cors({
    origin: 'https://3000-firebase-fra-samanvaya-1758383690579.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/schemes', require('./routes/schemes'));

module.exports = app;
