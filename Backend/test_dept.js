const mongoose = require('mongoose');
mongoose.connect('mongodb://172.17.241.122:27017/cms_db').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'head@test.com' });
  const dept = await db.collection('departments').findOne({ _id: user.departmentId });
  console.log("User departmentId:", user.departmentId);
  console.log("Found dept:", dept ? dept.name : "null");
  process.exit(0);
});
