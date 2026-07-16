-- Safe coupon migration. Run once on the Railway database.
CREATE TABLE IF NOT EXISTS offers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  coupon_code VARCHAR(40) NOT NULL UNIQUE,
  discount_type ENUM('percentage','flat','free_delivery') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0,
  maximum_discount DECIMAL(10,2) DEFAULT NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_limit INT DEFAULT NULL,
  per_user_limit INT NOT NULL DEFAULT 1,
  category_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS cart_coupons (
  user_id INT PRIMARY KEY,
  offer_id INT NOT NULL,
  coupon_code VARCHAR(40) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE RESTRICT
);
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(40) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN grand_total DECIMAL(10,2) NOT NULL DEFAULT 0;
INSERT INTO offers (title,coupon_code,discount_type,discount_value,minimum_order,maximum_discount,active,starts_at,ends_at)
VALUES
 ('Welcome 10% OFF','WELCOME10','percentage',10,199,100,TRUE,'2026-01-01','2026-12-31 23:59:59'),
 ('Flat ₹50 OFF','SAVE50','flat',50,399,NULL,TRUE,'2026-01-01','2026-12-31 23:59:59'),
 ('First Order 15% OFF','FIRSTORDER','percentage',15,299,150,TRUE,'2026-01-01','2026-12-31 23:59:59'),
 ('Free Delivery','FREEDEL','free_delivery',0,499,NULL,TRUE,'2026-01-01','2026-12-31 23:59:59')
ON DUPLICATE KEY UPDATE title=VALUES(title),active=VALUES(active),minimum_order=VALUES(minimum_order),maximum_discount=VALUES(maximum_discount);
