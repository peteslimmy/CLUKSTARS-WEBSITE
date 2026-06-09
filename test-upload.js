const http = require('http');
const fs = require('fs');
const path = require('path');
const filePath = path.resolve('admin/public/favicon.svg');
const fileBuffer = fs.readFileSync(filePath);
const boundary = '----TestBoundary' + Date.now();
const header = Buffer.from(
  '--' + boundary + '\r\n' +
  'Content-Disposition: form-data; name="file"; filename="test.svg"\r\n' +
  'Content-Type: image/svg+xml\r\n\r\n'
);
const footer = Buffer.from('\r\n--' + boundary + '--\r\n');
const body = Buffer.concat([header, fileBuffer, footer]);
const loginData = JSON.stringify({ email: 'admin@clukstars.com', password: 'Admin@123456' });
const loginReq = http.request('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const token = JSON.parse(d).accessToken;
    const uploadReq = http.request('http://localhost:4000/api/media/upload-brand', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length
      }
    }, (res2) => {
      let d2 = ''; res2.on('data', c => d2 += c);
      res2.on('end', () => {
        const r = JSON.parse(d2);
        console.log('Brand upload URL:', r.url);
        const verify = http.get('http://localhost:4000' + r.url, (res3) => {
          console.log('Status:', res3.statusCode, 'Type:', res3.headers['content-type']);
        });
      });
    });
    uploadReq.write(body); uploadReq.end();
  });
});
loginReq.write(loginData); loginReq.end();
