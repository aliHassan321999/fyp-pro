const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const depts = await mongoose.connection.collection('departments').find({ name: { $in: ['Housekeeping', 'Landscaping'] } }).toArray();
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (const dept of depts) {
    const prefix = dept.name.toLowerCase().substring(0, 5);
    
    // Create Head
    const headEmail = `${prefix}head@test.com`;
    await mongoose.connection.collection('users').updateOne(
      { email: headEmail },
      {
        $setOnInsert: {
          email: headEmail,
          password: hashedPassword,
          role: 'department_head',
          departmentId: dept._id,
          profile: {
            firstName: dept.name,
            lastName: 'Head',
            fullName: `${dept.name} Head`,
            cnic: `12345678901${prefix}`
          },
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Created Head for ${dept.name}: ${headEmail} / password123`);
    
    // Create Staff
    const staffEmail = `${prefix}staff@test.com`;
    await mongoose.connection.collection('users').updateOne(
      { email: staffEmail },
      {
        $setOnInsert: {
          email: staffEmail,
          password: hashedPassword,
          role: 'staff',
          departmentId: dept._id,
          profile: {
            firstName: dept.name,
            lastName: 'Staff',
            fullName: `${dept.name} Staff`,
            position: 'Worker',
            cnic: `09876543210${prefix}`
          },
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Created Staff for ${dept.name}: ${staffEmail} / password123`);
  }
  
  process.exit(0);
});
