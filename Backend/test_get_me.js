const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const token = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
    
    console.log("Logged in. Token:", token);
    
    // Now get me
    const req2 = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': token
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => console.log(data2));
    });
    req2.end();
  });
});

req.write(JSON.stringify({email: 'fakeadmin4@gmail.com', password: 'password123'}));
req.end();
