-- FlavorHub production food data repair
-- Safe to run more than once: it only fills missing image/nutrition values.
-- Select the Railway `railway` database in MySQL Workbench before running.

UPDATE food_items
SET
  image = COALESCE(NULLIF(image, ''), '/uploads/food/margherita-pizza.png'),
  calories = COALESCE(calories, 420),
  protein = COALESCE(protein, 18),
  carbohydrates = COALESCE(carbohydrates, 45),
  fat = COALESCE(fat, 14),
  fiber = COALESCE(fiber, 4),
  sugar = COALESCE(sugar, 6),
  sodium = COALESCE(sodium, 700),
  spice_level = COALESCE(NULLIF(spice_level, ''), 'Medium'),
  health_score = COALESCE(health_score, 66),
  nutrition_verified = COALESCE(nutrition_verified, FALSE)
WHERE name = 'Margherita Pizza';

UPDATE food_items
SET
  image = COALESCE(NULLIF(image, ''), '/uploads/food/classic-veg-burger.png'),
  calories = COALESCE(calories, 430),
  protein = COALESCE(protein, 15),
  carbohydrates = COALESCE(carbohydrates, 48),
  fat = COALESCE(fat, 19),
  fiber = COALESCE(fiber, 5),
  sugar = COALESCE(sugar, 7),
  sodium = COALESCE(sodium, 650),
  spice_level = COALESCE(NULLIF(spice_level, ''), 'Medium'),
  health_score = COALESCE(health_score, 56),
  nutrition_verified = COALESCE(nutrition_verified, FALSE)
WHERE name = 'Veggie Burger';

UPDATE food_items
SET
  image = COALESCE(NULLIF(image, ''), '/uploads/food/paneer-butter-masala.png'),
  calories = COALESCE(calories, 320),
  protein = COALESCE(protein, 14),
  carbohydrates = COALESCE(carbohydrates, 35),
  fat = COALESCE(fat, 12),
  fiber = COALESCE(fiber, 6),
  sugar = COALESCE(sugar, 5),
  sodium = COALESCE(sodium, 560),
  spice_level = COALESCE(NULLIF(spice_level, ''), 'Medium'),
  health_score = COALESCE(health_score, 65),
  nutrition_verified = COALESCE(nutrition_verified, FALSE)
WHERE name = 'Paneer Butter Masala';

UPDATE food_items
SET
  image = COALESCE(NULLIF(image, ''), '/uploads/food/cold-coffee.png'),
  calories = COALESCE(calories, 150),
  protein = COALESCE(protein, 4),
  carbohydrates = COALESCE(carbohydrates, 28),
  fat = COALESCE(fat, 4),
  fiber = COALESCE(fiber, 1),
  sugar = COALESCE(sugar, 22),
  sodium = COALESCE(sodium, 90),
  spice_level = COALESCE(NULLIF(spice_level, ''), 'Mild'),
  health_score = COALESCE(health_score, 78),
  nutrition_verified = COALESCE(nutrition_verified, FALSE)
WHERE name = 'Cold Coffee';

UPDATE food_items
SET
  image = COALESCE(NULLIF(image, ''), '/uploads/food/chocolate-brownie.png'),
  calories = COALESCE(calories, 380),
  protein = COALESCE(protein, 6),
  carbohydrates = COALESCE(carbohydrates, 52),
  fat = COALESCE(fat, 17),
  fiber = COALESCE(fiber, 3),
  sugar = COALESCE(sugar, 32),
  sodium = COALESCE(sodium, 180),
  spice_level = COALESCE(NULLIF(spice_level, ''), 'Mild'),
  health_score = COALESCE(health_score, 48),
  nutrition_verified = COALESCE(nutrition_verified, FALSE)
WHERE name = 'Chocolate Brownie';

-- Confirm the repair. Every listed row should now have an image and score.
SELECT id, name, image, calories, protein, carbohydrates, fat, health_score
FROM food_items
WHERE name IN ('Margherita Pizza', 'Veggie Burger', 'Paneer Butter Masala', 'Cold Coffee', 'Chocolate Brownie')
ORDER BY id;
