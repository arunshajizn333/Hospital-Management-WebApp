// seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Your DB connection function
const Admin = require('./models/Admin');   // Your Admin model

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Admin User Details (Customize these)
    const adminEmail = 'admin@hospital.com';
    const adminPassword = 'DefaultAdminPassword123!'; // Choose a strong default password
    const adminName = 'Super Admin';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user with this email already exists. No new admin created.');
      return; // Exit if admin exists
    }

    // Create new admin user
    const newAdmin = new Admin({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // The pre-save hook in Admin.js will hash this
      role: 'admin' // Ensure role is set, though model has default
    });

    await newAdmin.save();
    console.log('Default Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword} (Change this after first login!)`);

  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1); // Exit with error
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// Run the seeder function
seedAdmin();