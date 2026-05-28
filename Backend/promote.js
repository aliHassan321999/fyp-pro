const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const result = await mongoose.connection.collection('users').updateOne(
    { email: 'staff@test.com' },
    { $set: { role: 'department_head' } }
  );
  console.log('Update Result:', result);
  process.exit(0);
});
