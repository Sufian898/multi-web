import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

const teacherCvUploadDir = path.join(process.cwd(), 'uploads', 'teacher-cv');

const hasCloudinary =
  Boolean(process.env.CLOUDINARY_URL) ||
  (Boolean(process.env.CLOUDINARY_CLOUD_NAME) && Boolean(process.env.CLOUDINARY_API_KEY) && Boolean(process.env.CLOUDINARY_API_SECRET));

if (hasCloudinary) {
  cloudinary.config({ secure: true });
}

async function uploadPdfToCloudinary(buffer) {
  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'Life Changer Way/teacher-cv',
        resource_type: 'raw',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// @desc    Upload teacher CV (PDF)
// @route   POST /api/teachers/upload-resume
// @access  Private
export const uploadTeacherResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });

    // Prefer Cloudinary in production/serverless
    if (hasCloudinary && req.file.buffer) {
      const result = await uploadPdfToCloudinary(req.file.buffer);
      const url = result?.secure_url || result?.url;
      if (!url) return res.status(500).json({ message: 'Upload failed' });
      return res.json({ url });
    }

    // Local dev fallback: write to disk under /uploads/teacher-cv
    fs.mkdirSync(teacherCvUploadDir, { recursive: true });
    const filename = `cv-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`;
    const fullPath = path.join(teacherCvUploadDir, filename);
    fs.writeFileSync(fullPath, req.file.buffer);

    const url = `${req.protocol}://${req.get('host')}/uploads/teacher-cv/${filename}`;
    return res.json({ url });
  } catch (error) {
    console.error('uploadTeacherResume error:', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

// @desc    Register as teacher
// @route   POST /api/teachers/register
// @access  Private
export const registerTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, whatsapp, address, qualification, experience, specialization, bio, resume, portfolio } = req.body;

    if (!fullName || !email || !phone || !whatsapp || !qualification || !experience) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (!resume) {
      return res.status(400).json({ message: 'CV/Resume PDF is required' });
    }

    // Check if already registered
    const existingTeacher = await Teacher.findOne({ userId: req.user._id });
    if (existingTeacher) {
      return res.status(400).json({ message: 'You are already registered as a teacher' });
    }

    const teacher = await Teacher.create({
      userId: req.user._id,
      fullName,
      email,
      phone,
      whatsapp,
      address: address || '',
      qualification,
      experience,
      specialization: specialization || [],
      bio: bio || '',
      resume: resume || '',
      portfolio: portfolio || '',
      status: 'pending'
    });

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('userId', 'username name email')
      .populate('specialization', 'name icon');

    res.status(201).json({
      message: 'Teacher registration submitted successfully',
      teacher: populatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teachers (Admin)
// @route   GET /api/teachers
// @access  Private/Admin
export const getAllTeachers = async (req, res) => {
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
        { phone: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(query)
      .populate('userId', 'username name email')
      .populate('specialization', 'name icon')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'username name email')
      .populate('specialization', 'name icon');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if user is admin or the teacher themselves
    if (!req.user.isAdmin && teacher.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher status (Admin)
// @route   PUT /api/teachers/:id/status
// @access  Private/Admin
export const updateTeacherStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (status) teacher.status = status;
    if (adminNotes !== undefined) teacher.adminNotes = adminNotes;

    await teacher.save();

    res.json({ message: 'Teacher status updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete teacher (Admin)
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user is registered as teacher
// @route   GET /api/teachers/check
// @access  Private
export const checkTeacherRegistration = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    res.json({ isRegistered: !!teacher, teacher: teacher || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
