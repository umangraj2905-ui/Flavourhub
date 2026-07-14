/* Adds nullable nutrition fields without touching existing food rows. */
const db=require('../models/db');
const columns=[
 ['calories','ALTER TABLE food_items ADD COLUMN calories INT NULL'],
 ['protein','ALTER TABLE food_items ADD COLUMN protein DECIMAL(6,2) NULL'],
 ['carbohydrates','ALTER TABLE food_items ADD COLUMN carbohydrates DECIMAL(6,2) NULL'],
 ['fat','ALTER TABLE food_items ADD COLUMN fat DECIMAL(6,2) NULL'],
 ['fiber','ALTER TABLE food_items ADD COLUMN fiber DECIMAL(6,2) NULL'],
 ['sugar','ALTER TABLE food_items ADD COLUMN sugar DECIMAL(6,2) NULL'],
 ['sodium','ALTER TABLE food_items ADD COLUMN sodium DECIMAL(8,2) NULL'],
 ['spice_level',"ALTER TABLE food_items ADD COLUMN spice_level ENUM('Mild','Medium','Hot') NULL"],
 ['health_score','ALTER TABLE food_items ADD COLUMN health_score INT NULL'],
 ['is_vegetarian','ALTER TABLE food_items ADD COLUMN is_vegetarian BOOLEAN NOT NULL DEFAULT TRUE'],
 ['nutrition_verified','ALTER TABLE food_items ADD COLUMN nutrition_verified BOOLEAN NOT NULL DEFAULT FALSE']
];
(async()=>{try{for(const [name,sql] of columns){const [rows]=await db.execute('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?',['food_items',name]);if(!rows.length){await db.execute(sql);console.log('Added food_items.'+name)}}console.log('Nutrition database check complete.')}catch(error){console.error('Nutrition setup failed:',error.message);process.exitCode=1}finally{await db.end()}})();
