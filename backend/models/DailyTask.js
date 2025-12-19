import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  youtubeLink: {
    type: String,
    required: true,
    trim: true
  },
  taskDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  payment: {
    type: Number,
    default: 0 // Payment amount in PKR for completing this task
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);

export default DailyTask;

