// Run once after importing schema.sql: node scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const db = require('../models/db');
(async () => {
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 10);
  await db.execute("INSERT INTO users(name,email,phone,password,address,role) VALUES(?,?,?,?,?,'admin') ON DUPLICATE KEY UPDATE password=VALUES(password),role='admin'", ['System Admin', 'admin@flavorhub.test', '9999999999', hash, 'FlavorHub Office']);
  console.log('Admin ready: admin@flavorhub.test (password is ADMIN_PASSWORD or Admin@123)');
  await db.end();
})();
