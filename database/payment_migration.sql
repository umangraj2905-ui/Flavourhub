-- Run once for an existing FlavorHub database. It does not store card, CVV, OTP, or UPI PIN details.
ALTER TABLE orders
  ADD COLUMN payment_method VARCHAR(30) NOT NULL DEFAULT 'Cash on Delivery' AFTER delivery_address,
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' AFTER payment_method,
  ADD COLUMN payment_reference VARCHAR(100) DEFAULT NULL AFTER payment_status,
  ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL AFTER payment_reference;
