import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { updateReferralChain } from '../utils/referralHelper.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, username, email, whatsapp, password, confirmPassword, referralCode } = req.body;

    // Validation
    if (!name || !username || !email || !whatsapp || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if username exists
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user (referralCode will be auto-generated if not provided)
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      whatsapp,
      password,
      referralCode: referralCode && referralCode.trim() !== '' ? referralCode.toUpperCase() : undefined
    });

    // Handle referral code if provided
    if (referralCode && referralCode.trim() !== '') {
      await updateReferralChain(user._id, referralCode);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      isVendor: user.isVendor,
      shopName: user.shopName,
      shopStatus: user.shopStatus,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail.toLowerCase() },
        { email: usernameOrEmail.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin,
      isVendor: user.isVendor,
      shopName: user.shopName,
      shopStatus: user.shopStatus,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('referredBy', 'username name');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

