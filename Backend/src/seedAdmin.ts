import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    const LOCAL_URI = 'mongodb://127.0.0.1:27017/cms_db';
    await mongoose.connect(LOCAL_URI);
    console.log('Connected to Database');

    const adminEmail = 'admin@cms.com';
    const adminPassword = 'Admin#Secure!CMS2026';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      accountStatus: 'active',
      profile: {
        fullName: 'System Administrator',
        phoneNumber: '00000000000',
        cnic: '00000-0000000-0',
        proofDocumentUrl: 'system-gen',
        profileImage: 'system-gen',
        address: {
          block: 'Admin',
          houseNumber: '1',
        }
      }
    });

    console.log(`Admin user created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
