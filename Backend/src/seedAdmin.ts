import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model';
import { Department } from './models/department.model';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    name: 'Test Admin',
    cnic: '11111-1111111-1'
  },
  {
    email: 'head@test.com',
    password: 'password123',
    role: 'department_head',
    name: 'Test Dept Head',
    cnic: '22222-2222222-2'
  },
  {
    email: 'staff@test.com',
    password: 'password123',
    role: 'staff',
    name: 'Test Staff Member',
    cnic: '33333-3333333-3'
  },
  {
    email: 'resident@test.com',
    password: 'password123',
    role: 'resident',
    name: 'Test Resident',
    cnic: '44444-4444444-4'
  }
];

const seedSystem = async () => {
  try {
    const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cms_db';
    await mongoose.connect(LOCAL_URI);
    console.log('Connected to Database');

    // 1. Cleanup specific users only (Departments will be upserted)
    await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    console.log('Old test user arrays purged.');

    // 2. Create sample department
    const admin = await User.findOne({ role: 'admin' }); // Try to find existing admin to be creator
    
    // Create a temporary admin if none exists to satisfy 'createdBy' requirement
    let creatorId = admin?._id;
    if (!creatorId) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      const tempAdmin = await User.create({
        email: 'internal-admin@cms.com',
        password: hashedPassword,
        role: 'admin',
        accountStatus: 'active',
        profile: { cnic: '00000-0000000-0', fullName: 'System' }
      });
      creatorId = tempAdmin._id;
    }

    const departmentsData = [
      { name: 'General', description: 'Handling general sequence and unassigned routing.', slaTargetHours: 48, keywords: ['fees', 'billing', 'visitor pass', 'dispute', 'portal issue'] },
      { name: 'Maintenance', description: 'Handling all building and facility issues.', slaTargetHours: 24, keywords: ['plumbing pipe', 'electrical fault', 'carpentry', 'hvac', 'leak', 'wiring', 'ac service', 'broken', 'heater element'] },
      { name: 'Security', description: 'Handling all security and vigilance.', slaTargetHours: 12, keywords: ['trespassing', 'noise complaint', 'guard', 'gate', 'theft', 'suspicious person', 'cameras', 'fight', 'parking violation', 'property damage'] },
      { name: 'Housekeeping', description: 'Cleaning and hygiene control.', slaTargetHours: 24, keywords: ['trash removal', 'garbage', 'dirty corridor', 'lobby', 'bad smell', 'cleaning', 'dog poop', 'common area spill', 'elevator clean'] },
      { name: 'Landscaping', description: 'Exterior ground maintenance and horticulture.', slaTargetHours: 48, keywords: ['mowing grass', 'dead trees', 'fallen branches', 'pavement crack', 'broken sprinklers', 'garden weed', 'soil'] }
    ];

    const createdDepts = [];
    for (const d of departmentsData) {
       // Safe Upserting to prevent duplicates or accidental live truncation
       const dept = await Department.findOneAndUpdate(
         { name: d.name },
         { ...d, createdBy: creatorId },
         { upsert: true, new: true }
       );
       createdDepts.push(dept);
    }
    console.log('5 Classification Departments created natively.');
    const mainDept = createdDepts.find(d => d.name === 'Maintenance') || createdDepts[0];

    // 3. Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (const u of users) {
      const newUser = await User.create({
        email: u.email,
        password: hashedPassword,
        role: u.role,
        accountStatus: 'active',
        departmentId: (u.role === 'staff' || u.role === 'department_head') ? mainDept._id : undefined,
        profile: {
          fullName: u.name,
          cnic: u.cnic,
          phone: '03001234567',
          address: { block: 'A', houseNumber: '101', street: 'Test St' }
        }
      });
      
      if (u.role === 'department_head' && newUser) {
        mainDept.headOfDepartment = newUser._id as any;
        await mainDept.save();
      }
      console.log(`Created ${u.role}: ${u.email}`);
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('All passwords: password123');
    console.log('Roles created: Admin, Dept Head, Staff, Resident');
    console.log('Core Depts Seeded securely: General, Maintenance, Security, Housekeeping, Landscaping');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding system:', error);
    process.exit(1);
  }
};

seedSystem();
