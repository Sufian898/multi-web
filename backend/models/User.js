import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  whatsapp: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined but enforces uniqueness when present
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralLevel: {
    type: Number,
    default: 0 // 0 = no referral, 1 = level 1, 2 = level 2, 3 = level 3
  },
  // Referral chain tracking
  level1Referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  level2Referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  level3Referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Earnings
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  pendingEarnings: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  taskEarnings: {
    type: Number,
    default: 0
  },
  blogEarnings: {
    type: Number,
    default: 0
  },
  shopEarnings: {
    type: Number,
    default: 0
  },
  // Account status
  isBlocked: {
    type: Boolean,
    default: false
  },
  isVendor: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Vendor shop info
  shopName: {
    type: String,
    default: ''
  },
  shopStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate referral code if not provided (fallback - controller should set it)
userSchema.pre('save', async function(next) {
  // Only generate if referralCode is not set and this is a new document
  if (this.isNew && (!this.referralCode || this.referralCode.trim() === '')) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      // Generate unique referral code with timestamp and random string
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const randomPart1 = Math.random().toString(36).substring(2, 7).toUpperCase();
      const randomPart2 = Math.random().toString(36).substring(2, 7).toUpperCase();
      const usernamePart = (this.username || 'USER').toUpperCase().slice(0, 3);
      const nanoTime = process.hrtime ? process.hrtime.bigint().toString(36).toUpperCase().slice(-3) : Math.random().toString(36).substring(2, 5).toUpperCase();
      
      this.referralCode = usernamePart + timestamp + randomPart1 + randomPart2 + nanoTime;
      
      // Check if code already exists
      const query = { referralCode: this.referralCode };
      const existingUser = await mongoose.model('User').findOne(query);
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
      
      // Small delay to ensure timestamp changes
      if (!isUnique && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // Fallback if still not unique (very unlikely)
    if (!isUnique) {
      this.referralCode = 'REF' + Date.now() + Math.random().toString(36).substring(2, 15).toUpperCase();
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

