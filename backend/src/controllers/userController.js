const User = require('../models/User');

// Get the currently authenticated user's profile
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by the requireAuth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, district } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password, // Password hashing happens in User model pre-save hook
      role,
      district,
      status: 'Active'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Inactive'
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    // Basic validation for Base64 string (optional but good practice)
    if (!avatarUrl || !avatarUrl.startsWith('data:image')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    // Check size (approximate from base64 length)
    // Base64 is ~1.33x larger than binary. 500KB binary ~= 666KB base64.
    if (avatarUrl.length > 700000) {
      return res.status(400).json({ message: 'Image too large (max 500KB)' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ message: 'Server error updating avatar' });
  }
};
