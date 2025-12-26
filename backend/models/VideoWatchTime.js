import mongoose from 'mongoose';

const videoWatchTimeSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyTask',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  watchTime: {
    type: Number,
    default: 0 // in seconds
  },
  lastWatchTime: {
    type: Number,
    default: 0 // last position in video (seconds)
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one record per user per task
videoWatchTimeSchema.index({ taskId: 1, userId: 1 }, { unique: true });

const VideoWatchTime = mongoose.model('VideoWatchTime', videoWatchTimeSchema);

export default VideoWatchTime;

