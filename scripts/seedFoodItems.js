/*
 * Safe, repeatable menu seed. It adds categories and food only when missing,
 * and only fills the image path of the five original sample records.
 * Run: node scripts/seedFoodItems.js
 */
const db = require('../models/db');

const categories = ['Pizza', 'Burger', 'Indian', 'Drinks', 'Desserts', 'South Indian', 'Chinese'];
const originalImages = {
  'Margherita Pizza': '/uploads/food/margherita-pizza.png',
  'Veggie Burger': '/uploads/food/classic-veg-burger.png',
  'Paneer Butter Masala': '/uploads/food/paneer-butter-masala.png',
  'Cold Coffee': '/uploads/food/cold-coffee.png',
  'Chocolate Brownie': '/uploads/food/chocolate-brownie.png'
};
// Better descriptions for the five original sample records. These are updated
// every time the safe seed runs, so an older database also gets the new text.
const originalDescriptions = {
  'Margherita Pizza': 'Hand-stretched crust topped with tomato sauce, melted mozzarella, basil, and a touch of oregano.',
  'Veggie Burger': 'A crispy vegetable patty with fresh lettuce, tomato, onion, and our creamy house sauce.',
  'Paneer Butter Masala': 'Soft paneer cubes in a smooth, buttery tomato-cashew gravy finished with aromatic Indian spices.',
  'Cold Coffee': 'Chilled coffee blended with milk, ice cream, and ice for a rich and refreshing pick-me-up.',
  'Chocolate Brownie': 'A warm, fudgy chocolate brownie with a rich cocoa centre and a delightfully soft bite.'
};
// These are specific dish photographs, so they intentionally replace a prior category-level image.
const imageCorrections = {
  'Chole Bhature': '/uploads/food/chole-bhature.png',
  'Gulab Jamun': '/uploads/food/gulab-jamun.png',
  'Farmhouse Pizza': '/uploads/food/farmhouse-pizza.png',
  'Paneer Tikka Pizza': '/uploads/food/paneer-tikka-pizza.png',
  'Veggie Supreme Pizza': '/uploads/food/veggie-supreme-pizza.png',
  'Veggie Burger': '/uploads/food/veggie-burger.png',
  'Cheese Burger': '/uploads/food/cheese-burger.png',
  'Paneer Burger': '/uploads/food/paneer-burger.png',
  'Double Patty Burger': '/uploads/food/double-patty-burger.png',
  'Dal Makhani': '/uploads/food/dal-makhani.png',
  'Jeera Rice': '/uploads/food/jeera-rice.png',
  'Kadai Paneer': '/uploads/food/kadai-paneer.png',
  'Rajma Rice': '/uploads/food/rajma-rice.png',
  'Shahi Paneer': '/uploads/food/shahi-paneer.png',
  'Chocolate Shake': '/uploads/food/chocolate-shake.png',
  'Lemon Soda': '/uploads/food/lemon-soda.png',
  'Mango Shake': '/uploads/food/mango-shake.png',
  'Masala Chai': '/uploads/food/masala-chai.png',
  'Chocolate Cake': '/uploads/food/chocolate-cake.png',
  'Ice Cream Sundae': '/uploads/food/ice-cream-sundae.png',
  'Rasmalai': '/uploads/food/rasmalai.png',
  'Idli Sambar': '/uploads/food/idli-sambar.png',
  'Medu Vada': '/uploads/food/medu-vada.png',
  'Plain Dosa': '/uploads/food/plain-dosa.png',
  'Uttapam': '/uploads/food/uttapam.png',
  'Chilli Paneer': '/uploads/food/chilli-paneer.png',
  'Fried Rice': '/uploads/food/fried-rice.png',
  'Spring Rolls': '/uploads/food/spring-rolls.png',
  'Veg Manchurian': '/uploads/food/veg-manchurian.png'
};

// Category images are original local FlavorHub assets. Closely related menu variations reuse them.
const foods = [
  ['Indian', 'Shahi Paneer', 'Paneer in a silky cashew and tomato gravy finished with gentle spices.', 259, 'paneer-butter-masala.png'],
  ['Indian', 'Dal Makhani', 'Slow-cooked black lentils enriched with butter, cream, and warming spices.', 199, 'paneer-butter-masala.png'],
  ['Indian', 'Chole Bhature', 'Spiced chickpea curry served with two fluffy fried bhature.', 149, 'paneer-butter-masala.png'],
  ['Indian', 'Rajma Rice', 'Comforting kidney bean curry served with fragrant steamed rice.', 169, 'veg-biryani.png'],
  ['Indian', 'Veg Biryani', 'Layered basmati rice with vegetables, herbs, and aromatic biryani spices.', 219, 'veg-biryani.png'],
  ['Indian', 'Jeera Rice', 'Light and fragrant basmati rice tempered with roasted cumin.', 129, 'veg-biryani.png'],
  ['Indian', 'Kadai Paneer', 'Paneer and peppers tossed in a bold onion-tomato kadai masala.', 239, 'paneer-butter-masala.png'],
  ['South Indian', 'Masala Dosa', 'Crisp rice crepe filled with spiced potato, served with sambar and chutney.', 129, 'masala-dosa.png'],
  ['South Indian', 'Plain Dosa', 'Golden, paper-thin dosa served with coconut chutney and sambar.', 99, 'masala-dosa.png'],
  ['South Indian', 'Idli Sambar', 'Soft steamed rice cakes with hearty vegetable sambar and chutney.', 89, 'masala-dosa.png'],
  ['South Indian', 'Medu Vada', 'Crisp lentil fritters paired with sambar and coconut chutney.', 99, 'masala-dosa.png'],
  ['South Indian', 'Uttapam', 'Thick savoury rice pancake topped with onions, tomato, and coriander.', 119, 'masala-dosa.png'],
  ['Pizza', 'Farmhouse Pizza', 'Loaded with capsicum, onion, tomato, mushrooms, and mozzarella.', 299, 'margherita-pizza.png'],
  ['Pizza', 'Paneer Tikka Pizza', 'Smoky paneer tikka, peppers, and cheese on a tangy pizza base.', 329, 'margherita-pizza.png'],
  ['Pizza', 'Veggie Supreme Pizza', 'A colourful mix of garden vegetables with a generous cheese topping.', 349, 'margherita-pizza.png'],
  ['Burger', 'Classic Veg Burger', 'Crunchy vegetable patty with lettuce, tomato, onion, and house sauce.', 129, 'classic-veg-burger.png'],
  ['Burger', 'Cheese Burger', 'Vegetable patty layered with melted cheese, lettuce, and creamy sauce.', 159, 'classic-veg-burger.png'],
  ['Burger', 'Paneer Burger', 'Spiced paneer patty with crisp salad and tangy mint mayo.', 179, 'classic-veg-burger.png'],
  ['Burger', 'Double Patty Burger', 'Two hearty vegetable patties with fresh lettuce and signature sauce.', 219, 'classic-veg-burger.png'],
  ['Chinese', 'Veg Hakka Noodles', 'Wok-tossed noodles with crunchy vegetables and savoury soy seasoning.', 179, 'veg-hakka-noodles.png'],
  ['Chinese', 'Chilli Paneer', 'Crisp paneer cubes tossed with peppers in a spicy chilli sauce.', 229, 'veg-hakka-noodles.png'],
  ['Chinese', 'Veg Manchurian', 'Vegetable dumplings in a glossy, sweet, and spicy Indo-Chinese sauce.', 199, 'veg-hakka-noodles.png'],
  ['Chinese', 'Fried Rice', 'Wok-fried rice with vegetables, spring onion, and mild seasoning.', 169, 'veg-hakka-noodles.png'],
  ['Chinese', 'Spring Rolls', 'Golden vegetable spring rolls served with a tangy dipping sauce.', 139, 'veg-hakka-noodles.png'],
  ['Desserts', 'Gulab Jamun', 'Soft milk dumplings soaked in warm rose-cardamom sugar syrup.', 89, 'chocolate-brownie.png'],
  ['Desserts', 'Ice Cream Sundae', 'Vanilla and chocolate ice cream topped with sauce and nuts.', 149, 'chocolate-brownie.png'],
  ['Desserts', 'Rasmalai', 'Tender cottage cheese patties soaked in chilled saffron milk.', 119, 'chocolate-brownie.png'],
  ['Desserts', 'Chocolate Cake', 'Moist chocolate cake with smooth ganache and a rich cocoa finish.', 179, 'chocolate-brownie.png'],
  ['Drinks', 'Mango Shake', 'Thick, creamy mango shake blended with chilled milk and ice.', 119, 'cold-coffee.png'],
  ['Drinks', 'Chocolate Shake', 'Creamy chocolate shake blended until smooth and indulgent.', 139, 'cold-coffee.png'],
  ['Drinks', 'Lemon Soda', 'Sparkling lemon soda with a refreshing sweet and salty finish.', 69, 'cold-coffee.png'],
  ['Drinks', 'Masala Chai', 'A comforting cup of Indian tea brewed with aromatic spices.', 49, 'cold-coffee.png']
];

(async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const category of categories) {
      await connection.execute('INSERT INTO categories (category_name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(category_name)=LOWER(?))', [category, category]);
    }
    const [categoryRows] = await connection.execute('SELECT id, category_name FROM categories');
    const categoryIds = Object.fromEntries(categoryRows.map(row => [row.category_name.toLowerCase(), row.id]));
    for (const [name, image] of Object.entries(originalImages)) {
      await connection.execute('UPDATE food_items SET image=? WHERE name=? AND (image IS NULL OR image = \'\')', [image, name]);
    }
    for (const [category, name, description, price, filename] of foods) {
      const categoryId = categoryIds[category.toLowerCase()];
      await connection.execute(
        'INSERT INTO food_items (name, description, price, image, category_id, availability) SELECT ?, ?, ?, ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM food_items WHERE name=? AND category_id=?)',
        [name, description, price, `/uploads/food/${filename}`, categoryId, name, categoryId]
      );
    }
    // Keep descriptions helpful even when these records already existed before
    // this seed script was added.
    for (const [name, description] of Object.entries(originalDescriptions)) {
      await connection.execute('UPDATE food_items SET description=? WHERE name=?', [description, name]);
    }
    for (const [category, name, description] of foods) {
      await connection.execute('UPDATE food_items SET description=? WHERE name=? AND category_id=?', [description, name, categoryIds[category.toLowerCase()]]);
    }
    for (const [name, image] of Object.entries(imageCorrections)) {
      await connection.execute('UPDATE food_items SET image=? WHERE name=?', [image, name]);
    }
    await connection.commit();
    console.log(`Food seed complete. ${foods.length} new menu items were checked safely.`);
  } catch (error) {
    await connection.rollback();
    console.error('Food seed failed; no changes were saved.', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await db.end();
  }
})();
