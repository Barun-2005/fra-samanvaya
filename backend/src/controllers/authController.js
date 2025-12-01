const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

// Helper to generate and set tokens
const generateAndSetTokens = (res, user) => {
    const accessToken = jwt.sign({ user: { id: user._id, roles: user.roles } }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
    const refreshToken = jwt.sign({ user: { id: user._id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

exports.register = async (req, res) => {
    // ... (existing code)
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', { username, hasPassword: !!password });

    try {
        const user = await User.findOne({ username });
        console.log('👤 User found:', !!user);

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await user.comparePassword(password);
        console.log('🔑 Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If user has 2FA, send a temp token and require verification
        if (user.totpSecret) {
            const tempToken = jwt.sign({ userId: user._id, action: '2fa_verify' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
            return res.json({ requires2FA: true, tempToken });
        }

        generateAndSetTokens(res, user);
        console.log('✅ Login successful for:', username);
        res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.logout = (req, res) => {
    res.cookie('accessToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.verify2FA = async (req, res) => {
    const { tempToken, totpCode } = req.body;

    try {
        const decodedToken = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET);
        if (decodedToken.action !== '2fa_verify') {
            return res.status(401).json({ message: 'Invalid token purpose' });
        }

        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: totpCode,
        });

        if (!verified) {
            return res.status(401).json({ message: 'Invalid TOTP code' });
        }

        generateAndSetTokens(res, user);
        res.status(200).json({ message: 'Verification successful' });

    } catch (error) {
        res.status(500).json({ message: 'Error verifying 2FA', error });
    }
};

exports.setupTOTP = async (req, res) => {
    // ... (existing code)
};
