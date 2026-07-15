const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool reuses database connections and is better than opening one per request.
module.exports = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'food_ordering_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
