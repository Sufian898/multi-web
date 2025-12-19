import Class from '../models/Class.js';

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

// @desc    Create class (Admin)
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req, res) => {
  try {
    const { title, description, zoomLink, classTime, status } = req.body;

    if (!title || !zoomLink || !classTime) {
      return res.status(400).json({ message: 'Please provide title, zoom link, and class time' });
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

// @desc    Update class (Admin)
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, zoomLink, classTime, status } = req.body;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
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

// @desc    Delete class (Admin)
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Class.findByIdAndDelete(id);

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

