import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postLink: {
    type: String,
    required: true
  },
  requiredActions: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    groups: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // in seconds
    subscribers: { type: Number, default: 0 }
  },
  quantity: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  completedCount: {
    type: Number,
    default: 0
  },
  workerPay: {
    type: Number,
    default: 1.0 // PKR per task
  },
  level1Commission: {
    type: Number,
    default: 0.10
  },
  level2Commission: {
    type: Number,
    default: 0.10
  },
  level3Commission: {
    type: Number,
    default: 0.10
  },
  companyShare: {
    type: Number,
    default: 0.30
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

