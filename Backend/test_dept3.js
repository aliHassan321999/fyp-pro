const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect('mongodb://127.0.0.1:27017/cms_db').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'head@test.com' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '15m' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/departments', {
      headers: { Cookie: `accessToken=${token}` }
    });
    console.log("Success! Data:", res.data.data.map(d => ({ id: d._id, name: d.name })));
  } catch (err) {
    console.log("Error status:", err.response ? err.response.status : err.message);
    console.log("Error data:", err.response ? err.response.data : "");
  }
  process.exit(0);
});
