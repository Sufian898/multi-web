import mongoose from 'mongoose';

const WithdrawalBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const AppSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'app-settings', index: true },

    // Referral settings
    referralSignupBonus: { type: Number, default: 30, min: 0 },

    // Video watch earnings settings
    // Stored per minute to keep it simple for admins
    videoEarningRatePerMinute: { type: Number, default: 0.1, min: 0 },

    // Withdrawal settings
    minWithdrawalAmount: { type: Number, default: 100, min: 0 },
    withdrawalBanks: { type: [WithdrawalBankSchema], default: [] },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('AppSettings', AppSettingsSchema);
