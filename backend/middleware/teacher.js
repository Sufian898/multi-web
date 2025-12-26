import Teacher from '../models/Teacher.js';

/**
 * Allow only APPROVED teachers (or admin).
 * Assumes `protect` middleware has already set `req.user`.
 */
export const teacherApproved = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.isAdmin) return next();

    const teacher = await Teacher.findOne({ userId: req.user._id }).select('status');
    if (!teacher) {
      return res.status(403).json({ message: 'Teacher access required' });
    }

    if (teacher.status !== 'approved') {
      return res.status(403).json({ message: `Teacher request ${teacher.status}` });
    }

    return next();
  } catch (error) {
    console.error('teacherApproved error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



