import DailyTask from '../models/DailyTask.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';

// @desc    Get all daily tasks
// @route   GET /api/admin/daily-tasks
// @access  Private/Admin
export const getAllDailyTasks = async (req, res) => {
  try {
    const tasks = await DailyTask.find()
      .populate('createdBy', 'username name')
      .sort({ taskDate: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active daily tasks (Public)
// @route   GET /api/daily-tasks
// @access  Public
export const getActiveDailyTasks = async (req, res) => {
  try {
    // Get all active tasks, regardless of date
    const tasks = await DailyTask.find({
      status: 'active'
    })
      .populate('createdBy', 'username name')
      .sort({ taskDate: -1, createdAt: -1 })
      .limit(20);

    console.log(`Found ${tasks.length} active daily tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching active daily tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create daily task
// @route   POST /api/admin/daily-tasks
// @access  Private/Admin
export const createDailyTask = async (req, res) => {
  try {
    const { title, description, youtubeLink, taskDate, payment } = req.body;

    if (!title || !youtubeLink) {
      return res.status(400).json({ message: 'Please provide title and YouTube link' });
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(youtubeLink)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const task = await DailyTask.create({
      title,
      description,
      youtubeLink,
      taskDate: taskDate ? new Date(taskDate) : new Date(),
      payment: payment || 0,
      createdBy: req.user._id
    });

    const populatedTask = await DailyTask.findById(task._id)
      .populate('createdBy', 'username name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update daily task
// @route   PUT /api/admin/daily-tasks/:id
// @access  Private/Admin
export const updateDailyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeLink, taskDate, status, payment } = req.body;

    const task = await DailyTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (youtubeLink) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(youtubeLink)) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
      task.youtubeLink = youtubeLink;
    }
    if (taskDate) task.taskDate = new Date(taskDate);
    if (status) task.status = status;
    if (payment !== undefined) task.payment = payment;

    await task.save();

    const populatedTask = await DailyTask.findById(task._id)
      .populate('createdBy', 'username name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete daily task
// @route   DELETE /api/admin/daily-tasks/:id
// @access  Private/Admin
export const deleteDailyTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await DailyTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await DailyTask.findByIdAndDelete(id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark task as completed by user
// @route   POST /api/daily-tasks/:id/complete
// @access  Private
export const completeDailyTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await DailyTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if already completed
    const alreadyCompleted = task.completedBy.some(
      (item) => item.user.toString() === req.user._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    task.completedBy.push({
      user: req.user._id,
      completedAt: new Date()
    });

    task.views += 1;
    await task.save();

    // Credit payment to user if task has payment amount
    if (task.payment && task.payment > 0) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.taskEarnings += task.payment;
        user.currentBalance += task.payment;
        user.totalEarnings += task.payment;
        await user.save();

        // Create earning record
        await Earning.create({
          userId: user._id,
          type: 'task',
          amount: task.payment,
          status: 'approved',
          description: `Daily task completion: ${task.title}`,
          referenceId: task._id
        });
      }
    }

    res.json({ 
      message: 'Task marked as completed',
      payment: task.payment || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

