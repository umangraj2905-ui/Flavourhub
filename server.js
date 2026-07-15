const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./models/db');

const app = express();
// Railway provides a public HTTPS origin. Keep local development open, but
// allow a specific production frontend origin when CORS_ORIGIN is configured.
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/authRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.get('/api/public/stats', require('./controllers/statsController').publicStats);
// Railway uses this lightweight endpoint to confirm that the process is alive.
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/health/database', async (_req, res) => {
  try { await db.execute('SELECT 1'); res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'unavailable' }); }
});

// The browser still enhances these pages with public/js/app.js, but each route
// also gets useful server-rendered content. This makes direct requests, crawlers,
// and users with JavaScript disabled see the correct page instead of an empty shell.
const pageTitles = {
  home: 'FlavorHub | Food Ordering', menu: 'Menu | FlavorHub', offers: 'Offers | FlavorHub',
  login: 'Login | FlavorHub', register: 'Register | FlavorHub', about: 'About | FlavorHub',
  contact: 'Contact | FlavorHub'
};
function initialPageMarkup(page) {
  const pages = {
    home: '<section class="container py-5"><h1>Fresh food, delivered fast.</h1><p>Restaurant-quality meals from FlavorHub.</p><a href="/menu">Explore Menu</a></section>',
    menu: '<section class="container py-5"><h1>Our Menu</h1><input aria-label="Search food" placeholder="Search food by name"><div class="menu-food-card"><h2>Featured Food</h2><span>Price</span><button type="button">Add to Cart</button></div></section>',
    offers: '<section class="container py-5"><h1>Today’s Best Offers</h1><article class="offer-card"><h2>Welcome Offer</h2><p>Save on your first order.</p><button type="button">Copy Coupon</button></article></section>',
    login: '<section class="container py-5"><h1>Welcome back</h1><form id="serverAuthFallback"><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required></label><button type="submit">Login</button></form></section>',
    register: '<section class="container py-5"><h1>Create your account</h1><form><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" required></label><button type="submit">Register</button></form></section>',
    about: '<section class="container py-5"><h1>About FlavorHub</h1><p>FlavorHub is an online food ordering system for fresh, convenient meals.</p></section>',
    contact: '<section class="container py-5"><h1>Contact FlavorHub</h1><p>Call +91 98765 43210 or email hello@flavorhub.test.</p><form id="contactForm"><label>Name<input name="name" required></label><label>Email<input type="email" name="email" required></label><label>Message<textarea name="message" required></textarea></label><button type="submit">Send Message</button></form></section>'
  };
  return pages[page] || '<section class="container py-5"><h1>FlavorHub</h1></section>';
}
function renderPage(page) {
  const template = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8');
  const title = pageTitles[page] || 'FlavorHub | Food Ordering';
  return template.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    .replace('<main id="app"></main>', `<main id="app" data-server-page="${page}">${initialPageMarkup(page)}</main>`);
}
const pages = ['','about','contact','offers','login','register','menu','food-details','cart','checkout','order-confirmation','order-history','dashboard','admin-login','admin-dashboard','manage-food','manage-categories','manage-orders','manage-customers'];
pages.forEach(page => app.get(`/${page}`, (_req, res) => res.type('html').send(renderPage(page || 'home'))));
// Friendly aliases used by common links and bookmarks.
[['/orders', 'order-history'], ['/profile', 'profile'], ['/admin/login', 'admin-login']].forEach(([route, page]) => app.get(route, (_req, res) => res.type('html').send(renderPage(page))));
// Keep API errors JSON and prevent unknown browser URLs from silently showing Home.
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((_req, res) => res.status(404).send('Page not found.'));
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image must be smaller than 3 MB.' });
  if (err.message === 'Only JPG, PNG, and WebP food images are allowed.') return res.status(400).json({ message: err.message });
  console.error(err); res.status(500).json({ message: 'Something went wrong on the server.' });
});
// 0.0.0.0 lets hosting services such as Railway receive public web requests.
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Food app running on port ${port}`));

const required = process.env.NODE_ENV === 'production' ? ['JWT_SECRET'] : [];
const missing = required.filter(name => !process.env[name]);
if (missing.length) console.error(`Missing required environment variables: ${missing.join(', ')}`);
db.execute('SELECT 1').then(() => console.log('Database connection successful')).catch(() => console.error('Database unavailable'));
