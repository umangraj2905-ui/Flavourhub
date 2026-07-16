# FlavorHub — Online Food Ordering System

A college minor project using HTML/CSS/Bootstrap/JavaScript, Node.js/Express, MySQL and JWT authentication. It has customer ordering and admin management flows, responsive UI, image uploads, and REST APIs.

## Setup

1. Install Node.js (v18+) and MySQL.
2. Copy `.env.example` to `.env` and fill in your MySQL password and a long `JWT_SECRET`.
3. Import `database/schema.sql` in MySQL Workbench, or run `mysql -u root -p < database/schema.sql`.
4. Run `npm install`.
5. Create the administrator: `node scripts/createAdmin.js`. Default email is `admin@flavorhub.test`; default password is `Admin@123`. Set `ADMIN_PASSWORD` first to change it.
6. Add the expanded local-image menu safely: `node scripts/seedFoodItems.js`.
7. Run `npm start`, then visit `http://localhost:3000`.

## Deploy publicly with GitHub and Railway

1. Install Git, create a GitHub account, and create an empty repository.
2. In this project folder run `git init`, `git add .`, `git commit -m "Initial FlavorHub project"`, then add your GitHub repository as `origin` and run `git push -u origin main`.
3. On Railway, create a new project and choose **Deploy from GitHub Repo**. Select this repository. Railway detects Node.js automatically and uses `npm start`.
4. Add a MySQL service in the same Railway project. Copy its connection values into the application service variables:
   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`.
5. Set `NODE_ENV=production`. `JWT_SECRET` must be a long random value; never commit it or put it in source code. Set `CORS_ORIGIN` only if you later use a separate frontend domain; for this single Express app it can remain empty.
6. Import `database/schema.sql` into the Railway MySQL database. Then run the safe migration scripts once from a local machine connected to that database if your schema does not already contain payment and nutrition columns.
7. In Railway, open **Settings → Networking → Generate Domain**. Your public link will look like `https://your-service.up.railway.app`.
8. Open that HTTPS link in a browser and test registration, login, menu, cart, checkout, and admin login.

Railway's normal filesystem is temporary between deployments. Uploaded food images already committed in `uploads/food/` are safe, but new admin uploads should use a Railway Volume or object storage for permanent production storage. Do not upload `.env`, database dumps containing private data, or credentials to GitHub.

## Project structure

```
controllers/  Request logic for auth, food, cart, orders and admin
routes/       REST endpoint definitions
models/       MySQL connection pool
middleware/   JWT role checks and Multer image upload handling
database/     SQL schema and sample menu data
public/       Bootstrap-based CSS and browser JavaScript
views/        Main responsive UI shell
uploads/      Food images uploaded by administrators
docs/         API reference, ER diagram and Postman collection
```

## Module walkthrough

1. `server.js` configures Express, static files, APIs and named page URLs.
2. `models/db.js` creates the reusable MySQL pool.
3. `authController.js` validates registration, hashes passwords with bcrypt, and creates JWTs on login.
4. `auth.js` verifies a JWT; `adminOnly` prevents customers from using admin functions.
5. Food/category controllers perform CRUD; Multer saves validated image files in `uploads/`.
6. Cart controller keeps one row per user/food and validates positive quantities.
7. Order placement uses a transaction: creates an order, snapshots item prices, then clears the cart only if every query succeeds.
8. Admin controller provides dashboard totals, customer records and searchable orders.
9. `public/js/app.js` renders each required page based on its URL and calls the REST API with `fetch`.

## Testing

Import `docs/postman_collection.json` into Postman. Log in, copy the returned token to the `token` collection variable, then send protected requests. Test invalid email/password, duplicate registration, quantity `0`, an empty checkout, and admin-only endpoints with a customer token.

## Git

```bash
git init
git add .
git commit -m "Build food ordering system"
```

See [API documentation](docs/API.md) and [ER diagram](docs/ER-DIAGRAM.md).

## Repair missing production food images and health data

If the menu shows blank images or the health meter says that nutrition is unavailable,
the production `food_items` rows need their optional image/nutrition columns filled.
Open `database/production_food_fix.sql` in MySQL Workbench, select the Railway
`railway` schema, and click the lightning (Execute) button. The script is safe to
run repeatedly and does not delete or replace existing values.

## Order for Someone Else

Run `node scripts/ensureRecipientColumns.js` once in the Railway FlavorHub
service Console (or run `database/order_recipient_migration.sql` in Workbench).
Existing orders remain self-orders. Checkout then offers **Myself** and
**Someone Else** choices; recipient details belong to the purchaser's order and
are never saved as the purchaser's profile.
