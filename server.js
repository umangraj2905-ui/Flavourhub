const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// Each named page uses one beginner-friendly single-page UI; the page value controls the content.
const pages = ['','about','contact','offers','login','register','menu','food-details','cart','checkout','order-confirmation','order-history','dashboard','admin-login','admin-dashboard','manage-food','manage-categories','manage-orders','manage-customers'];
pages.forEach(page => app.get(`/${page}`, (_req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html'))));
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image must be smaller than 3 MB.' });
  if (err.message === 'Only JPG, PNG, and WebP food images are allowed.') return res.status(400).json({ message: err.message });
  console.error(err); res.status(500).json({ message: 'Something went wrong on the server.' });
});
// 0.0.0.0 lets hosting services such as Railway receive public web requests.
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Food app running on port ${port}`));
