require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// สร้างฐานข้อมูลจำลองเก็บ URL ย่อ
let urlDatabase = {};
let idCounter = 1;

// ฟังก์ชันตรวจสอบ URL
function isValidUrl(urlString) {
  const urlObject = urlparser.parse(urlString);
  return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
}

// POST request สำหรับย่อ URL
app.post('/api/shorturl', function(req, res) {
  let original_url = req.body.url; // รับ URL จาก request body

  // ตรวจสอบว่ารูปแบบ URL ถูกต้องหรือไม่
  if (!isValidUrl(original_url)) {
    return res.json({ error: 'invalid url' });
  }

  let short_url = idCounter++; // สร้าง short_url แบบสุ่ม

  // บันทึกลงในฐานข้อมูลจำลอง
  urlDatabase[short_url] = original_url;

  res.json({ original_url: original_url, short_url: short_url });
});

// GET request สำหรับ redirect ไปยัง original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  let short_url = req.params.short_url;
  let original_url = urlDatabase[short_url];

  // ถ้าไม่มี URL ให้ส่ง 404
  if (!original_url) {
    return res.status(404).json({ error: 'No short URL found' });
  }

  // redirect ไปยัง original URL
  res.redirect(original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
