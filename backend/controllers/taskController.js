import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';
import { distributeReferralEarnings } from '../utils/referralHelper.js';

// @desc    Create new task (Client)
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { postLink, requiredActions, quantity, cost } = req.body;

    if (!postLink || !quantity || !cost) {
      return res.status(400).json({ message: 'Please provide post link, quantity, and cost' });
    }

    const task = await Task.create({
      clientId: req.user._id,
      postLink,
      requiredActions: requiredActions || {},
      quantity,
      cost,
      workerPay: 1.0,
      level1Commission: 0.10,
      level2Commission: 0.10,
      level3Commission: 0.10,
      companyShare: 0.30
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'active' })
      .populate('clientId', 'username name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit task proof
// @route   POST /api/tasks/:taskId/submit
// @access  Private
export const submitTask = async (req, res) => {
  try {
    const { proof } = req.body;
    const { taskId } = req.params;

    if (!proof) {
      return res.status(400).json({ message: 'Please provide proof' });
    }

    const task = await Task.findById(taskId);
    if (!task || task.status !== 'active') {
      return res.status(404).json({ message: 'Task not found or not active' });
    }

    // Check if already submitted
    const existingSubmission = await TaskSubmission.findOne({
      taskId,
      workerId: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Task already submitted' });
    }

    const submission = await TaskSubmission.create({
      taskId,
      workerId: req.user._id,
      proof,
      earnings: task.workerPay,
      status: 'pending'
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's task submissions
// @route   GET /api/tasks/my-submissions
// @access  Private
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ workerId: req.user._id })
      .populate('taskId')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve task submission (Admin)
// @route   PUT /api/tasks/submissions/:submissionId/approve
// @access  Private/Admin
export const approveSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await TaskSubmission.findById(submissionId).populate('taskId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status === 'approved') {
      return res.status(400).json({ message: 'Submission already approved' });
    }

    submission.status = 'approved';
    await submission.save();

    // Update user earnings
    const user = await User.findById(submission.workerId);
    user.taskEarnings += submission.earnings;
    user.currentBalance += submission.earnings;
    user.totalEarnings += submission.earnings;
    await user.save();

    // Create earning record
    await Earning.create({
      userId: user._id,
      type: 'task',
      amount: submission.earnings,
      status: 'approved',
      description: 'Task completion earnings',
      referenceId: submission.taskId._id,
      taskSubmissionId: submission._id
    });

    // Distribute referral earnings
    await distributeReferralEarnings(user._id, submission.taskId._id, submission.earnings);

    // Update task completed count
    submission.taskId.completedCount += 1;
    if (submission.taskId.completedCount >= submission.taskId.quantity) {
      submission.taskId.status = 'completed';
    }
    await submission.taskId.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject task submission (Admin)
// @route   PUT /api/tasks/submissions/:submissionId/reject
// @access  Private/Admin
export const rejectSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { adminNotes } = req.body;

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = 'rejected';
    if (adminNotes) submission.adminNotes = adminNotes;
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

