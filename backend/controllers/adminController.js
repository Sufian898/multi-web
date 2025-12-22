import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Class from '../models/Class.js';
import Withdrawal from '../models/Withdrawal.js';
import Earning from '../models/Earning.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { search, isBlocked, isVendor } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (isVendor !== undefined) {
      query.isVendor = isVendor === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('referredBy', 'username name')
      .populate('level1Referrals', 'username name createdAt')
      .populate('level2Referrals', 'username name createdAt')
      .populate('level3Referrals', 'username name createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const earnings = await Earning.find({ userId: user._id }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      earnings,
      withdrawals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
export const approveVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVendor) {
      return res.status(400).json({ message: 'User is not a vendor' });
    }

    user.shopStatus = 'approved';
    await user.save();

    res.json({ message: 'Vendor approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject vendor
// @route   PUT /api/admin/vendors/:id/reject
// @access  Private/Admin
export const rejectVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.shopStatus = 'rejected';
    await user.save();

    res.json({ message: 'Vendor rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ isVendor: true });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalTasks = await Task.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const pendingVendors = await User.countDocuments({ shopStatus: 'pending' });

    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);

    const totalWithdrawals = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalWithdrawals' } } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        vendors: totalVendors,
        pendingVendors
      },
      shop: {
        products: totalProducts,
        orders: totalOrders
      },
      content: {
        blogs: totalBlogs,
        pendingBlogs,
        tasks: totalTasks
      },
      financial: {
        totalEarnings: totalEarnings[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        pendingWithdrawals
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending blogs
// @route   GET /api/admin/blogs/pending
// @access  Private/Admin
export const getPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' })
      .populate('author', 'username name email')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending task submissions
// @route   GET /api/admin/tasks/submissions/pending
// @access  Private/Admin
export const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ status: 'pending' })
      .populate('taskId')
      .populate('workerId', 'username name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

