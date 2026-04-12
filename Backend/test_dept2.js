const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'head@test.com' });
  const dept = await db.collection('departments').findOne({ _id: user.departmentId });
  console.log("User departmentId:", user.departmentId);
  console.log("Found dept by user.departmentId:", dept ? dept.name : "null");
  
  const allDepts = await db.collection('departments').find({}).toArray();
  console.log("All department IDs:", allDepts.map(d => d._id));
  
  process.exit(0);
});
