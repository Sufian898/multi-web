import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import AppSettings from '../models/AppSettings.js';

const DEFAULT_MIN_WITHDRAWAL_AMOUNT = 100; // PKR

// @desc    Request withdrawal
// @route   POST /api/withdrawals
// @access  Private
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, accountDetails } = req.body;
    const settings = await AppSettings.findOne({ key: 'app-settings' })
      .select('minWithdrawalAmount')
      .lean();
    const minWithdrawalAmount =
      typeof settings?.minWithdrawalAmount === 'number' ? settings.minWithdrawalAmount : DEFAULT_MIN_WITHDRAWAL_AMOUNT;

    if (!amount || !paymentMethod || !accountDetails) {
      return res.status(400).json({ message: 'Please provide amount, payment method, and account details' });
    }

    if (amount < minWithdrawalAmount) {
      return res.status(400).json({ message: `Minimum withdrawal amount is ${minWithdrawalAmount} PKR` });
    }

    const user = await User.findById(req.user._id);

    if (user.currentBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check for pending withdrawals
    const pendingWithdrawal = await Withdrawal.findOne({
      userId: req.user._id,
      status: 'pending'
    });

    if (pendingWithdrawal) {
      return res.status(400).json({ message: 'You have a pending withdrawal request' });
    }

    // Deduct from balance
    user.currentBalance -= amount;
    user.pendingEarnings += amount;
    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: req.user._id,
      amount,
      paymentMethod,
      accountDetails
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user withdrawals
// @route   GET /api/withdrawals
// @access  Private
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all withdrawals (Admin)
// @route   GET /api/withdrawals/all
// @access  Private/Admin
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'username name email whatsapp')
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve withdrawal (Admin)
// @route   PUT /api/withdrawals/:id/approve
// @access  Private/Admin
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await Withdrawal.findById(id).populate('userId');
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Update user balance
    const user = withdrawal.userId;
    user.totalWithdrawals += withdrawal.amount;
    user.pendingEarnings -= withdrawal.amount;
    await user.save();

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject withdrawal (Admin)
// @route   PUT /api/withdrawals/:id/reject
// @access  Private/Admin
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate('userId');
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    withdrawal.status = 'rejected';
    if (adminNotes) withdrawal.adminNotes = adminNotes;
    await withdrawal.save();

    // Refund to user balance
    const user = withdrawal.userId;
    user.currentBalance += withdrawal.amount;
    user.pendingEarnings -= withdrawal.amount;
    await user.save();

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

