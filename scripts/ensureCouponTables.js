/* Safe, repeatable production coupon setup. Run in Railway Flavourhub Console. */
const db = require('../models/db');

(async () => {
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS offers (
      id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(150) NOT NULL,
      coupon_code VARCHAR(40) NOT NULL UNIQUE,
      discount_type ENUM('percentage','flat','free_delivery') NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
      minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0,
      maximum_discount DECIMAL(10,2) DEFAULT NULL,
      starts_at DATETIME NULL, ends_at DATETIME NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE, usage_limit INT DEFAULT NULL,
      per_user_limit INT DEFAULT 1, category_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS cart_coupons (
      user_id INT PRIMARY KEY, offer_id INT NOT NULL, coupon_code VARCHAR(40) NOT NULL,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(offer_id) REFERENCES offers(id) ON DELETE RESTRICT
    )`);
    const cols = [
      ['subtotal', 'DECIMAL(10,2) NOT NULL DEFAULT 0'],
      ['delivery_fee', 'DECIMAL(10,2) NOT NULL DEFAULT 0'],
      ['gst_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0'],
      ['coupon_code', 'VARCHAR(40) DEFAULT NULL'],
      ['discount_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0'],
      ['grand_total', 'DECIMAL(10,2) NOT NULL DEFAULT 0']
    ];
    for (const [name, type] of cols) {
      const [rows] = await db.execute('SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=\'orders\' AND COLUMN_NAME=?', [name]);
      if (!rows.length) await db.execute(`ALTER TABLE orders ADD COLUMN ${name} ${type}`);
    }
    const offers = [
      ['Welcome 10% OFF', 'WELCOME10', 'percentage', 10, 199, 100],
      ['Flat ₹50 OFF', 'SAVE50', 'flat', 50, 399, null],
      ['First Order 15% OFF', 'FIRSTORDER', 'percentage', 15, 299, 150],
      ['Free Delivery', 'FREEDEL', 'free_delivery', 0, 499, null]
    ];
    for (const offer of offers) {
      await db.execute(
        'INSERT INTO offers(title,coupon_code,discount_type,discount_value,minimum_order,maximum_discount,active,starts_at,ends_at) VALUES(?,?,?,?,?,?,TRUE,\'2026-01-01\',\'2026-12-31 23:59:59\') ON DUPLICATE KEY UPDATE active=TRUE,minimum_order=VALUES(minimum_order),maximum_discount=VALUES(maximum_discount)',
        offer
      );
    }
    console.log('Coupon database setup complete.');
  } catch (error) {
    console.error('Coupon setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
