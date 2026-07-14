-- Run this file in MySQL Workbench or with: mysql -u root -p < database/schema.sql
CREATE DATABASE IF NOT EXISTS food_ordering_system;
USE food_ordering_system;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE food_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image VARCHAR(255) DEFAULT NULL,
  category_id INT NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT TRUE,
  calories INT NULL,
  protein DECIMAL(6,2) NULL,
  carbohydrates DECIMAL(6,2) NULL,
  fat DECIMAL(6,2) NULL,
  fiber DECIMAL(6,2) NULL,
  sugar DECIMAL(6,2) NULL,
  sodium DECIMAL(8,2) NULL,
  spice_level ENUM('Mild','Medium','Hot') NULL,
  health_score INT NULL,
  is_vegetarian BOOLEAN NOT NULL DEFAULT TRUE,
  nutrition_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  UNIQUE KEY unique_cart_item (user_id, food_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending','Preparing','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  delivery_address TEXT NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'Cash on Delivery',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  payment_reference VARCHAR(100) DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

INSERT INTO categories (category_name) VALUES ('Pizza'), ('Burger'), ('Indian'), ('Drinks'), ('Desserts');
INSERT INTO food_items (name, description, price, category_id, availability) VALUES
('Margherita Pizza', 'Classic pizza with tomato, mozzarella and basil.', 249.00, 1, true),
('Veggie Burger', 'Grilled vegetable patty, lettuce and house sauce.', 159.00, 2, true),
('Paneer Butter Masala', 'Paneer in a rich tomato and butter gravy.', 229.00, 3, true),
('Cold Coffee', 'Chilled coffee blended with milk and ice cream.', 99.00, 4, true),
('Chocolate Brownie', 'Warm chocolate brownie served with a smile.', 119.00, 5, true);
