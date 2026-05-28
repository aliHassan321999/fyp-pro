const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const depts = await mongoose.connection.collection('departments').find({ name: { $in: ['Housekeeping', 'Landscaping', 'Maintenance'] } }).toArray();
  
  for (const dept of depts) {
    console.log('\n=======================================');
    console.log('DEPARTMENT:', dept.name.toUpperCase());
    
    const head = await mongoose.connection.collection('users').findOne({ role: 'department_head', departmentId: dept._id });
    if (head) {
      console.log('HEAD:', head.email, '(Password: password123)');
    } else {
      console.log('HEAD: None assigned');
    }
    
    const staff = await mongoose.connection.collection('users').find({ role: 'staff', departmentId: dept._id }).toArray();
    if (staff.length > 0) {
      console.log('STAFF:');
      staff.forEach(s => console.log('  -', s.email, '(Password: password123)'));
    } else {
      console.log('STAFF: None assigned');
    }
  }
  
  process.exit(0);
});
