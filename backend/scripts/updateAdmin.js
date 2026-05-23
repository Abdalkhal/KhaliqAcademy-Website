const mongoose = require('mongoose');
const { Admin } = require('../models');
require('dotenv').config({ path: '../.env' });

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khaliq_elearning');
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne();
    if (!admin) {
      console.log('No admin found!');
      process.exit(1);
    }

    const args = process.argv.slice(2);
    const newUsername = args[0];
    const newPassword = args[1];

    if (!newUsername || !newPassword) {
      console.log('Usage: node updateAdmin.js <newUsername> <newPassword>');
      process.exit(1);
    }

    admin.username = newUsername;
    admin.password = newPassword;
    await admin.save();

    console.log(`✅ Admin credentials updated successfully!`);
    console.log(`New Username: ${newUsername}`);
    console.log(`New Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
