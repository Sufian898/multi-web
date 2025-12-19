import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  preferredCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
