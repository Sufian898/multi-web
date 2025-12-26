import mongoose from 'mongoose';

const AdminReplySchema = new mongoose.Schema(
  {
    message: { type: String, trim: true, default: '' },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const contactMessageSchema = new mongoose.Schema(
  {
    trackingCode: { type: String, unique: true, index: true, required: true },

    // Optional link to logged-in user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    status: { type: String, enum: ['open', 'replied', 'closed'], default: 'open' },
    adminReply: { type: AdminReplySchema, default: () => ({}) },

    // For user-side notification tracking (optional)
    userLastSeenReplyAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
