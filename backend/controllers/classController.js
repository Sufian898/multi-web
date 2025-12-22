import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('createdBy', 'username name')
      .sort({ classTime: -1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get classes created by me (Teacher/Admin)
// @route   GET /api/classes/mine
// @access  Private (Approved Teacher/Admin)
export const getMyClasses = async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { createdBy: req.user._id };

    const classes = await Class.find(query)
      .populate('createdBy', 'username name')
      .sort({ classTime: -1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get live classes
// @route   GET /api/classes/live
// @access  Public
export const getLiveClasses = async (req, res) => {
  try {
    const now = new Date();
    const classes = await Class.find({
      status: 'live',
      classTime: { $lte: now }
    })
      .populate('createdBy', 'username name')
      .sort({ classTime: -1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create class (Admin/Approved Teacher)
// @route   POST /api/classes
// @access  Private/Admin or Approved Teacher
export const createClass = async (req, res) => {
  try {
    const { title, description, zoomLink, classTime, status } = req.body;

    if (!title || !zoomLink || !classTime) {
      return res.status(400).json({ message: 'Please provide title, zoom link, and class time' });
    }

    // Non-admin must be an approved teacher
    if (!req.user.isAdmin) {
      const teacher = await Teacher.findOne({ userId: req.user._id }).select('status');
      if (!teacher) return res.status(403).json({ message: 'Teacher access required' });
      if (teacher.status !== 'approved') {
        return res.status(403).json({ message: `Teacher request ${teacher.status}` });
      }
    }

    const newClass = await Class.create({
      title,
      description,
      zoomLink,
      classTime: new Date(classTime),
      status: status || 'upcoming',
      createdBy: req.user._id
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update class (Admin / owner teacher)
// @route   PUT /api/classes/:id
// @access  Private/Admin or Approved Teacher (own)
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, zoomLink, classTime, status } = req.body;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Teacher can only update their own classes
    if (!req.user.isAdmin && classItem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title) classItem.title = title;
    if (description !== undefined) classItem.description = description;
    if (zoomLink) classItem.zoomLink = zoomLink;
    if (classTime) classItem.classTime = new Date(classTime);
    if (status) classItem.status = status;

    await classItem.save();

    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete class (Admin / owner teacher)
// @route   DELETE /api/classes/:id
// @access  Private/Admin or Approved Teacher (own)
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Teacher can only delete their own classes
    if (!req.user.isAdmin && classItem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Class.findByIdAndDelete(id);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

