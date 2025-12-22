import VideoWatchTime from '../models/VideoWatchTime.js';
import DailyTask from '../models/DailyTask.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';
import AppSettings from '../models/AppSettings.js';

const DEFAULT_RATE_PER_MINUTE = 0.1;

const getVideoRates = async () => {
  try {
    const doc = await AppSettings.findOne({ key: 'app-settings' })
      .select('videoEarningRatePerMinute')
      .lean();
    const perMinute =
      typeof doc?.videoEarningRatePerMinute === 'number'
        ? doc.videoEarningRatePerMinute
        : DEFAULT_RATE_PER_MINUTE;
    const safePerMinute = Number.isFinite(perMinute) && perMinute >= 0 ? perMinute : DEFAULT_RATE_PER_MINUTE;
    return { perMinute: safePerMinute, perSecond: safePerMinute / 60 };
  } catch (e) {
    return { perMinute: DEFAULT_RATE_PER_MINUTE, perSecond: DEFAULT_RATE_PER_MINUTE / 60 };
  }
};

// @desc    Update video watch time
// @route   PUT /api/daily-tasks/:taskId/watch-time
// @access  Private
export const updateWatchTime = async (req, res) => {
  try {
    const { perMinute, perSecond } = await getVideoRates();
    const { taskId } = req.params;
    const { watchTime, lastWatchTime, isCompleted } = req.body;

    if (watchTime === undefined || lastWatchTime === undefined) {
      return res.status(400).json({ message: 'Watch time and last watch time are required' });
    }

    const task = await DailyTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let watchTimeRecord = await VideoWatchTime.findOne({
      taskId,
      userId: req.user._id
    });

    const previousWatchTime = watchTimeRecord ? watchTimeRecord.watchTime : 0;
    const newWatchTime = Math.max(previousWatchTime, watchTime);
    const additionalWatchTime = newWatchTime - previousWatchTime;

    if (watchTimeRecord) {
      watchTimeRecord.watchTime = newWatchTime;
      watchTimeRecord.lastWatchTime = lastWatchTime;
      if (isCompleted && !watchTimeRecord.isCompleted) {
        watchTimeRecord.isCompleted = true;
        watchTimeRecord.completedAt = new Date();
      }
      await watchTimeRecord.save();
    } else {
      watchTimeRecord = await VideoWatchTime.create({
        taskId,
        userId: req.user._id,
        watchTime: newWatchTime,
        lastWatchTime,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null
      });
    }

    // Calculate and add earnings based on additional watch time
    if (additionalWatchTime > 0) {
      const earnings = additionalWatchTime * perSecond;
      
      if (earnings > 0) {
        const user = await User.findById(req.user._id);
        user.currentBalance += earnings;
        user.totalEarnings += earnings;
        // Track video earnings separately if needed
        await user.save();

        // Create earning record every 10 seconds of watch time (to avoid too many records)
        if (Math.floor(newWatchTime) % 10 === 0 || additionalWatchTime >= 10) {
          await Earning.create({
            userId: user._id,
            type: 'task',
            amount: earnings,
            status: 'approved',
            description: `Video watch time earnings (${Math.floor(newWatchTime)}s)`,
            referenceId: taskId
          });
        }
      }
    }

    // Get updated user balance
    const user = await User.findById(req.user._id);

    res.json({
      watchTime: watchTimeRecord.watchTime,
      lastWatchTime: watchTimeRecord.lastWatchTime,
      isCompleted: watchTimeRecord.isCompleted,
      currentBalance: user.currentBalance,
      earningsFromWatchTime: newWatchTime * perSecond,
      earningRatePerMinute: perMinute
    });
  } catch (error) {
    console.error('Error updating watch time:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's watch time for a task
// @route   GET /api/daily-tasks/:taskId/watch-time
// @access  Private
export const getWatchTime = async (req, res) => {
  try {
    const { taskId } = req.params;

    const watchTimeRecord = await VideoWatchTime.findOne({
      taskId,
      userId: req.user._id
    });

    if (!watchTimeRecord) {
      return res.json({
        watchTime: 0,
        lastWatchTime: 0,
        isCompleted: false
      });
    }

    res.json({
      watchTime: watchTimeRecord.watchTime,
      lastWatchTime: watchTimeRecord.lastWatchTime,
      isCompleted: watchTimeRecord.isCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users watch time for a task (Admin)
// @route   GET /api/admin/daily-tasks/:taskId/watch-times
// @access  Private/Admin
export const getAllWatchTimes = async (req, res) => {
  try {
    const { taskId } = req.params;

    const watchTimes = await VideoWatchTime.find({ taskId })
      .populate('userId', 'username name email')
      .sort({ watchTime: -1 });

    res.json(watchTimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's video watch earnings summary
// @route   GET /api/daily-tasks/video-earnings
// @access  Private
export const getVideoEarnings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { perMinute, perSecond } = await getVideoRates();
    
    // Get all watch time records for the user
    const watchTimes = await VideoWatchTime.find({ userId })
      .populate('taskId', 'title youtubeLink')
      .sort({ createdAt: -1 });

    let totalWatchTime = 0;
    let totalEarnings = 0;
    const taskEarnings = [];

    watchTimes.forEach(record => {
      const watchTimeSeconds = record.watchTime || 0;
      const earnings = watchTimeSeconds * perSecond;
      totalWatchTime += watchTimeSeconds;
      totalEarnings += earnings;
      
      if (record.taskId) {
        taskEarnings.push({
          taskId: record.taskId._id,
          taskTitle: record.taskId.title,
          watchTime: watchTimeSeconds,
          earnings: earnings,
          isCompleted: record.isCompleted
        });
      }
    });

    // Get current user balance
    const user = await User.findById(userId).select('currentBalance totalEarnings');

    res.json({
      totalWatchTime,
      totalEarnings,
      currentBalance: user.currentBalance,
      totalEarningsFromAllSources: user.totalEarnings,
      taskEarnings,
      earningRatePerSecond: perSecond,
      earningRatePerMinute: perMinute
    });
  } catch (error) {
    console.error('Error getting video earnings:', error);
    res.status(500).json({ message: error.message });
  }
};

