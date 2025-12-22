import User from '../models/User.js';
import Earning from '../models/Earning.js';
import Task from '../models/Task.js';
import AppSettings from '../models/AppSettings.js';

// Update referral chain when a new user registers
export const updateReferralChain = async (newUserId, referralCode) => {
  try {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    
    if (!referrer) {
      return null;
    }

    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return null;
    }

    // Set referredBy
    newUser.referredBy = referrer._id;
    newUser.referralLevel = 1;
    await newUser.save();

    // Update referrer's level 1 referrals
    referrer.level1Referrals.push(newUserId);
    
    // Credit 30 rupees to referrer for successful referral registration
    const settings = await AppSettings.findOne({ key: 'app-settings' })
      .select('referralSignupBonus')
      .lean();
    const referralBonus =
      typeof settings?.referralSignupBonus === 'number' ? settings.referralSignupBonus : 30;
    referrer.referralEarnings += referralBonus;
    referrer.currentBalance += referralBonus;
    referrer.totalEarnings += referralBonus;
    await referrer.save();

    // Create earning record for the referral bonus
    await Earning.create({
      userId: referrer._id,
      type: 'referral',
      amount: referralBonus,
      status: 'approved',
      description: `Referral bonus for new user registration`,
      referredUserId: newUserId,
      referralLevel: 1
    });

    // Update level 2 (referrer's referrer)
    if (referrer.referredBy) {
      const level2User = await User.findById(referrer.referredBy);
      if (level2User) {
        level2User.level2Referrals.push(newUserId);
        newUser.referralLevel = 2;
        await level2User.save();
        await newUser.save();

        // Update level 3 (level 2's referrer)
        if (level2User.referredBy) {
          const level3User = await User.findById(level2User.referredBy);
          if (level3User) {
            level3User.level3Referrals.push(newUserId);
            newUser.referralLevel = 3;
            await level3User.save();
            await newUser.save();
          }
        }
      }
    }

    return referrer;
  } catch (error) {
    console.error('Error updating referral chain:', error);
    return null;
  }
};

// Distribute referral earnings for task completion
export const distributeReferralEarnings = async (workerId, taskId, amount) => {
  try {
    const worker = await User.findById(workerId);
    if (!worker || !worker.referredBy) {
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return;
    }

    // Level 1 earnings
    const level1User = await User.findById(worker.referredBy);
    if (level1User) {
      const earning = task.level1Commission;
      level1User.referralEarnings += earning;
      level1User.currentBalance += earning;
      level1User.totalEarnings += earning;
      await level1User.save();

      await Earning.create({
        userId: level1User._id,
        type: 'referral',
        amount: earning,
        status: 'approved',
        description: `Level 1 referral commission from task`,
        referenceId: taskId,
        referredUserId: workerId,
        referralLevel: 1
      });

      // Level 2 earnings
      if (level1User.referredBy) {
        const level2User = await User.findById(level1User.referredBy);
        if (level2User) {
          const earning2 = task.level2Commission;
          level2User.referralEarnings += earning2;
          level2User.currentBalance += earning2;
          level2User.totalEarnings += earning2;
          await level2User.save();

          await Earning.create({
            userId: level2User._id,
            type: 'referral',
            amount: earning2,
            status: 'approved',
            description: `Level 2 referral commission from task`,
            referenceId: taskId,
            referredUserId: workerId,
            referralLevel: 2
          });

          // Level 3 earnings
          if (level2User.referredBy) {
            const level3User = await User.findById(level2User.referredBy);
            if (level3User) {
              const earning3 = task.level3Commission;
              level3User.referralEarnings += earning3;
              level3User.currentBalance += earning3;
              level3User.totalEarnings += earning3;
              await level3User.save();

              await Earning.create({
                userId: level3User._id,
                type: 'referral',
                amount: earning3,
                status: 'approved',
                description: `Level 3 referral commission from task`,
                referenceId: taskId,
                referredUserId: workerId,
                referralLevel: 3
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error distributing referral earnings:', error);
  }
};

