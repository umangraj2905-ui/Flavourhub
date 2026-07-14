const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool reuses database connections and is better than opening one per request.
module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_ordering_system',
  waitForConnections: true,
  connectionLimit: 10
});
