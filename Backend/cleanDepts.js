const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const result = await mongoose.connection.collection('departments').deleteMany({
    name: { $in: ['Maintanance', 'maintainance', 'General Maintenance'] }
  });
  console.log('Deleted typo departments:', result.deletedCount);
  process.exit(0);
});
