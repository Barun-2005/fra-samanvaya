const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role, maskedAadhaar } = req.body;

  try {
    const user = new User({
      username,
      password,
      role,
      maskedAadhaar,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      if (user.totpSecret) {
        const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
        return res.json({ twofaRequired: true, tempToken });

      }
  
      const accessToken = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
      const refreshToken = jwt.sign({ user: { id: user._id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
  
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ accessToken });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };

exports.verify2FA = async (req, res) => {
    const { tempToken, totpCode } = req.body;

    try {
      const decodedToken = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET);
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

      const accessToken = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
      const refreshToken = jwt.sign({ user: { id: user._id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });

      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ accessToken });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying 2FA', error });
    }
  };

exports.setupTOTP = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
          name: process.env.TOTP_ISSUER,
        });
    
        await User.findByIdAndUpdate(req.user.id, { totpSecret: secret.base32 });
    
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
          if (err) {
            return res.status(500).json({ message: 'Error generating QR code' });
          }
          res.json({
            secret: secret.base32,
            qrCodeUrl: data_url,
          });
        });
      } catch (error) {
        res.status(500).json({ message: 'Error setting up TOTP', error });
      }
};
