# API Documentation

Base URL: `http://localhost:3000/api`. Send `Authorization: Bearer <JWT>` for protected endpoints. Admin endpoints also require a user whose role is `admin`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Register `{name,email,phone,password,address}` |
| POST | `/login` | Public | Log in with `{email,password}`; returns token |
| POST | `/logout` | Public | Client logout acknowledgement |
| GET/PUT | `/profile` | Customer/Admin | Get or update own profile |
| GET | `/foods?search=&category=` | Public | Browse, search and filter available foods |
| GET | `/foods/:id` | Public | One food item |
| POST | `/foods` | Admin | Add food; use `multipart/form-data`, optional `image` |
| PUT/DELETE | `/foods/:id` | Admin | Update or delete food |
| GET/POST/PUT/DELETE | `/categories[/:id]` | GET public; rest admin | Category CRUD |
| GET/POST | `/cart` | Customer | View cart or add `{food_id,quantity}` |
| PUT/DELETE | `/cart/:id` | Customer | Change quantity or remove line |
| POST/GET | `/orders` | Customer | Place order / view own orders |
| GET | `/orders/:id` | Customer | Order and order-item details |
| PUT | `/orders/:id` | Admin | Update `{status}` |
| GET | `/admin/dashboard` | Admin | Counts and non-cancelled revenue |
| GET | `/admin/customers` | Admin | Customer list |
| GET | `/admin/orders?search=` | Admin | Search by order ID/customer name |

Validation: email format, 10–15 digit phone, password ≥8 characters, unique email, positive cart quantity, non-empty cart and delivery address at checkout.
