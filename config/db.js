<<<<<<< HEAD
const mysql = require("mysql2/promise"); // تأكدي من وجود /promise
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306, // تغيير من 3000 إلى 3306
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '', 
    database: process.env.DB_NAME || 'orgasmart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // تصدير الـ pool مباشرة
=======
//connection btwn db and the code each time
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3000,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
