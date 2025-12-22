import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Register as student
// @route   POST /api/students/register
// @access  Private
export const registerStudent = async (req, res) => {
  try {
    const { fullName, email, phone, whatsapp, address, education, experience, interests, preferredCategories } = req.body;

    if (!fullName || !email || !phone || !whatsapp) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if already registered
    const existingStudent = await Student.findOne({ userId: req.user._id });
    if (existingStudent) {
      return res.status(400).json({ message: 'You are already registered as a student' });
    }

    const interestsNormalized = Array.isArray(interests)
      ? interests
      : typeof interests === 'string'
        ? interests.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const student = await Student.create({
      userId: req.user._id,
      fullName,
      email,
      phone,
      whatsapp,
      address: address || '',
      education: education || '',
      experience: experience || '',
      interests: interestsNormalized,
      preferredCategories: preferredCategories || [],
      status: 'pending'
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'username name email')
      .populate('preferredCategories', 'name icon');

    res.status(201).json({
      message: 'Student registration submitted successfully',
      student: populatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students (Admin)
// @route   GET /api/students
// @access  Private/Admin
export const getAllStudents = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('userId', 'username name email')
      .populate('preferredCategories', 'name icon')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'username name email')
      .populate('preferredCategories', 'name icon');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user is admin or the student themselves
    if (!req.user.isAdmin && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student status (Admin)
// @route   PUT /api/students/:id/status
// @access  Private/Admin
export const updateStudentStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (status) student.status = status;
    if (adminNotes !== undefined) student.adminNotes = adminNotes;

    await student.save();

    res.json({ message: 'Student status updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student (Admin)
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user is registered as student
// @route   GET /api/students/check
// @access  Private
export const checkStudentRegistration = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    res.json({ isRegistered: !!student, student: student || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
