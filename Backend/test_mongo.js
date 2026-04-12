const mongoose = require('mongoose');
mongoose.connect('mongodb://172.17.241.122:27017/cms_db').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'fakeadmin4@gmail.com' });
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
});
