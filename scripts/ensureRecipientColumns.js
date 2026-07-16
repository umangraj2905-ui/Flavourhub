/* Safe, repeatable migration for ordering food for another person. */
const db = require('../models/db');

const columns = [
  ['order_for', "ALTER TABLE orders ADD COLUMN order_for ENUM('self','someone_else') NOT NULL DEFAULT 'self'"],
  ['recipient_name', 'ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(100) DEFAULT NULL'],
  ['recipient_phone', 'ALTER TABLE orders ADD COLUMN recipient_phone VARCHAR(20) DEFAULT NULL'],
  ['recipient_address', 'ALTER TABLE orders ADD COLUMN recipient_address VARCHAR(500) DEFAULT NULL'],
  ['recipient_landmark', 'ALTER TABLE orders ADD COLUMN recipient_landmark VARCHAR(150) DEFAULT NULL'],
  ['recipient_instructions', 'ALTER TABLE orders ADD COLUMN recipient_instructions VARCHAR(300) DEFAULT NULL'],
  ['recipient_relationship', 'ALTER TABLE orders ADD COLUMN recipient_relationship VARCHAR(50) DEFAULT NULL'],
  ['is_surprise', 'ALTER TABLE orders ADD COLUMN is_surprise BOOLEAN NOT NULL DEFAULT FALSE'],
  ['gift_message', 'ALTER TABLE orders ADD COLUMN gift_message VARCHAR(200) DEFAULT NULL']
];

(async () => {
  try {
    for (const [name, sql] of columns) {
      const [rows] = await db.execute('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?', ['orders', name]);
      if (!rows.length) { await db.execute(sql); console.log(`Added orders.${name}`); }
      else console.log(`Already exists: orders.${name}`);
    }
    console.log('Recipient order database check complete.');
  } catch (error) { console.error('Recipient order migration failed:', error.message); process.exitCode = 1; }
  finally { await db.end(); }
})();
