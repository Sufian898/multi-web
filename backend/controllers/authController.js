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

    // Check if WhatsApp number exists
    const whatsappExists = await User.findOne({ whatsapp: whatsapp.trim() });
    if (whatsappExists) {
      return res.status(400).json({ message: 'WhatsApp number already exists' });
    }

    // Generate unique referral code for new user
    const generateUniqueReferralCode = async () => {
      let isUnique = false;
      let code = '';
      let attempts = 0;
      const maxAttempts = 20;
      
      while (!isUnique && attempts < maxAttempts) {
        // Generate unique referral code with timestamp and random string
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        const randomPart1 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const randomPart2 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const usernamePart = (username || 'USER').toUpperCase().slice(0, 3);
        const nanoTime = process.hrtime.bigint().toString(36).toUpperCase().slice(-3);
        
        code = usernamePart + timestamp + randomPart1 + randomPart2 + nanoTime;
        
        // Check if code already exists
        const existingUser = await User.findOne({ referralCode: code });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
        
        // Small delay to ensure timestamp changes
        if (!isUnique && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Final fallback if still not unique (extremely unlikely)
      if (!isUnique) {
        code = 'REF' + Date.now() + Math.random().toString(36).substring(2, 15).toUpperCase();
      }
      
      return code;
    };

    // Create user with retry logic for duplicate key errors
    let user;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        const uniqueReferralCode = await generateUniqueReferralCode();
        
        user = await User.create({
          name,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          whatsapp,
          password,
          referralCode: uniqueReferralCode
        });
        
        break; // Success, exit retry loop
      } catch (error) {
        // Check if it's a duplicate key error for referralCode
        if (error.code === 11000 && error.keyPattern && error.keyPattern.referralCode) {
          retries++;
          if (retries >= maxRetries) {
            return res.status(500).json({ 
              message: 'Unable to create account. Please try again.' 
            });
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100 * retries));
        } else {
          // Other errors, throw immediately
          throw error;
        }
      }
    }

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

