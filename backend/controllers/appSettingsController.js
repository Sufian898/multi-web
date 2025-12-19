import AppSettings from '../models/AppSettings.js';

const DEFAULTS = {
  referralSignupBonus: 30,
  videoEarningRatePerMinute: 0.1,
  minWithdrawalAmount: 100,
  withdrawalBanks: [],
};

export const getAppSettings = async (req, res) => {
  try {
    let doc = await AppSettings.findOne({ key: 'app-settings' }).lean();
    if (!doc) {
      const created = await AppSettings.create({ key: 'app-settings', ...DEFAULTS });
      doc = created.toObject();
    }

    res.json({
      referralSignupBonus: doc.referralSignupBonus ?? DEFAULTS.referralSignupBonus,
      videoEarningRatePerMinute: doc.videoEarningRatePerMinute ?? DEFAULTS.videoEarningRatePerMinute,
      minWithdrawalAmount: doc.minWithdrawalAmount ?? DEFAULTS.minWithdrawalAmount,
      withdrawalBanks: Array.isArray(doc.withdrawalBanks) ? doc.withdrawalBanks : DEFAULTS.withdrawalBanks,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('getAppSettings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppSettings = async (req, res) => {
  try {
    const body = req.body || {};

    const referralSignupBonus = Number(body.referralSignupBonus);
    const videoEarningRatePerMinute = Number(body.videoEarningRatePerMinute);
    const minWithdrawalAmount = Number(body.minWithdrawalAmount);

    if (!Number.isFinite(referralSignupBonus) || referralSignupBonus < 0) {
      return res.status(400).json({ message: 'Invalid referralSignupBonus' });
    }

    if (!Number.isFinite(videoEarningRatePerMinute) || videoEarningRatePerMinute < 0) {
      return res.status(400).json({ message: 'Invalid videoEarningRatePerMinute' });
    }

    if (!Number.isFinite(minWithdrawalAmount) || minWithdrawalAmount < 0) {
      return res.status(400).json({ message: 'Invalid minWithdrawalAmount' });
    }

    const withdrawalBanks = Array.isArray(body.withdrawalBanks)
      ? body.withdrawalBanks
          .map((b) => ({
            name: String(b?.name || '').trim(),
            isActive: b?.isActive !== false,
          }))
          .filter((b) => b.name.length > 0)
      : [];

    // de-duplicate by name (case-insensitive)
    const seen = new Set();
    const uniqueBanks = [];
    for (const b of withdrawalBanks) {
      const key = b.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueBanks.push(b);
    }

    const update = {
      referralSignupBonus,
      videoEarningRatePerMinute,
      minWithdrawalAmount,
      withdrawalBanks: uniqueBanks,
      updatedBy: req.user?._id,
    };

    const doc = await AppSettings.findOneAndUpdate(
      { key: 'app-settings' },
      { $set: update, $setOnInsert: { key: 'app-settings' } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      referralSignupBonus: doc.referralSignupBonus,
      videoEarningRatePerMinute: doc.videoEarningRatePerMinute,
      minWithdrawalAmount: doc.minWithdrawalAmount,
      withdrawalBanks: doc.withdrawalBanks,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('updateAppSettings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
