import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proof: {
    type: String, // URL or text proof
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  earnings: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

export default TaskSubmission;

