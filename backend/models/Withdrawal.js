import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['easypaisa', 'jazzcash', 'bank', 'other'],
    required: true
  },
  accountDetails: {
    accountNumber: String,
    accountName: String,
    phoneNumber: String,
    bankName: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;

