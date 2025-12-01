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
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const claimRoutes = require('./routes/claims');
const documentRoutes = require('./routes/documents');
const assetRoutes = require('./routes/assets');
const schemeRoutes = require('./routes/schemes');
const atlasRoutes = require('./routes/atlas');
const knowledgeBaseRoutes = require('./routes/knowledgeBase');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/atlas', atlasRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
