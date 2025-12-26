import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['referral', 'task', 'blog', 'shop', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  description: {
    type: String,
    default: ''
  },
  // Reference IDs based on type
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // For referral earnings
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralLevel: {
    type: Number,
    default: null
  },
  // For task earnings
  taskSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskSubmission',
    default: null
  },
  // For blog earnings
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    default: null
  },
  // For shop earnings
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  }
}, {
  timestamps: true
});

const Earning = mongoose.model('Earning', earningSchema);

export default Earning;

