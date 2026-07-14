-- Safe nutrition migration for an existing FlavorHub database.
-- Run once after checking that these columns do not already exist.
ALTER TABLE food_items
  ADD COLUMN calories INT NULL,
  ADD COLUMN protein DECIMAL(6,2) NULL,
  ADD COLUMN carbohydrates DECIMAL(6,2) NULL,
  ADD COLUMN fat DECIMAL(6,2) NULL,
  ADD COLUMN fiber DECIMAL(6,2) NULL,
  ADD COLUMN sugar DECIMAL(6,2) NULL,
  ADD COLUMN sodium DECIMAL(8,2) NULL,
  ADD COLUMN spice_level ENUM('Mild','Medium','Hot') NULL,
  ADD COLUMN health_score INT NULL,
  ADD COLUMN is_vegetarian BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN nutrition_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Rollback (only if you intentionally want to remove this feature):
-- ALTER TABLE food_items DROP COLUMN calories, DROP COLUMN protein,
-- DROP COLUMN carbohydrates, DROP COLUMN fat, DROP COLUMN fiber,
-- DROP COLUMN sugar, DROP COLUMN sodium, DROP COLUMN spice_level,
-- DROP COLUMN health_score, DROP COLUMN is_vegetarian,
-- DROP COLUMN nutrition_verified;
