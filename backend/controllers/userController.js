import User from '../models/User.js';
import Earning from '../models/Earning.js';
import Withdrawal from '../models/Withdrawal.js';

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('referredBy', 'username name')
      .populate('level1Referrals', 'username name createdAt')
      .populate('level2Referrals', 'username name createdAt')
      .populate('level3Referrals', 'username name createdAt');

    // Get referral counts
    const level1Count = user.level1Referrals.length;
    const level2Count = user.level2Referrals.length;
    const level3Count = user.level3Referrals.length;

    // Get recent earnings
    const recentEarnings = await Earning.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get withdrawal history
    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        referralCode: user.referralCode,
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`,
        isVendor: user.isVendor,
        shopStatus: user.shopStatus
      },
      referralStats: {
        level1Count,
        level2Count,
        level3Count,
        level1Referrals: user.level1Referrals,
        level2Referrals: user.level2Referrals,
        level3Referrals: user.level3Referrals
      },
      earnings: {
        totalEarnings: user.totalEarnings,
        totalWithdrawals: user.totalWithdrawals,
        currentBalance: user.currentBalance,
        pendingEarnings: user.pendingEarnings,
        referralEarnings: user.referralEarnings,
        taskEarnings: user.taskEarnings,
        blogEarnings: user.blogEarnings,
        shopEarnings: user.shopEarnings
      },
      recentEarnings,
      withdrawals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, whatsapp } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email.toLowerCase();
    }
    if (whatsapp) user.whatsapp = whatsapp;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      whatsapp: user.whatsapp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get referral team details
// @route   GET /api/users/referrals
// @access  Private
export const getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('level1Referrals', 'username name email createdAt')
      .populate('level2Referrals', 'username name email createdAt')
      .populate('level3Referrals', 'username name email createdAt');

    res.json({
      level1: user.level1Referrals,
      level2: user.level2Referrals,
      level3: user.level3Referrals,
      counts: {
        level1: user.level1Referrals.length,
        level2: user.level2Referrals.length,
        level3: user.level3Referrals.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

