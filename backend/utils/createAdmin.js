import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminData = {
      name: 'Admin',
      username: 'admin',
      email: 'admin@gmail.com',
      whatsapp: '+923001234567',
      password: 'admin123',
      isAdmin: true,
      isVendor: false
    };

    const existingAdmin = await User.findOne({
      $or: [
        { username: adminData.username },
        { email: adminData.email }
      ]
    });

    if (existingAdmin) {
      // Ensure the existing admin matches the desired credentials/flags
      existingAdmin.name = adminData.name;
      existingAdmin.username = adminData.username;
      existingAdmin.email = adminData.email;
      existingAdmin.whatsapp = adminData.whatsapp;
      existingAdmin.isAdmin = true;
      existingAdmin.isVendor = false;
      // reset password to requested value (will be hashed by model hook)
      existingAdmin.password = adminData.password;
      await existingAdmin.save();

      console.log('Admin user already existed — updated credentials successfully!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123');
      process.exit(0);
    }

    const admin = await User.create(adminData);
    console.log('Admin user created successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

