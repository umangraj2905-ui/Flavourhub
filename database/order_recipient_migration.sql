-- Add support for ordering food for another person.
-- Run once against the active database. Existing orders are preserved and
-- receive the default value order_for='self'.
ALTER TABLE orders
  ADD COLUMN order_for ENUM('self','someone_else') NOT NULL DEFAULT 'self',
  ADD COLUMN recipient_name VARCHAR(100) NULL,
  ADD COLUMN recipient_phone VARCHAR(20) NULL,
  ADD COLUMN recipient_address VARCHAR(500) NULL,
  ADD COLUMN recipient_landmark VARCHAR(150) NULL,
  ADD COLUMN recipient_instructions VARCHAR(300) NULL,
  ADD COLUMN recipient_relationship VARCHAR(50) NULL,
  ADD COLUMN is_surprise BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN gift_message VARCHAR(200) NULL;

-- Rollback (only if you intentionally want to remove this feature):
-- ALTER TABLE orders
--   DROP COLUMN gift_message, DROP COLUMN is_surprise,
--   DROP COLUMN recipient_relationship, DROP COLUMN recipient_instructions,
--   DROP COLUMN recipient_landmark, DROP COLUMN recipient_address,
--   DROP COLUMN recipient_phone, DROP COLUMN recipient_name, DROP COLUMN order_for;
