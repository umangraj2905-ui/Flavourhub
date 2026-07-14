const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'development_secret');
const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res, next) => {
  try {
    // Trim accidental spaces so users can register from any device/browser reliably.
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').replace(/[\s-]/g, '');
    const password = req.body.password || '';
    const address = (req.body.address || '').trim();
    if (!name || !emailOk.test(email) || !/^\d{10,15}$/.test(phone) || !password || password.length < 8)
      return res.status(400).json({ message: 'Enter a valid name, email, 10-15 digit phone and password of at least 8 characters.' });
    const [exists] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'An account already uses this email.' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users (name,email,phone,password,address) VALUES (?,?,?,?,?)', [name, email, phone, hash, address]);
    res.status(201).json({ message: 'Registration successful. Please log in.', id: result.insertId });
  } catch (error) { next(error); }
};
exports.login = async (req, res, next) => {
  try {
    if (!jwtSecret) return res.status(500).json({ message: 'JWT_SECRET is not configured on the server.' });
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (!email || !password) return res.status(400).json({ message: 'Enter both email and password.' });
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) return res.status(401).json({ message: 'Incorrect email or password. New users must register first.' });
    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, jwtSecret, { expiresIn: '8h' });
    res.json({ message: 'Login successful.', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role } });
  } catch (error) { next(error); }
};
exports.profile = async (req, res, next) => { try { const [r] = await db.execute('SELECT id,name,email,phone,address,role FROM users WHERE id=?', [req.user.id]); res.json(r[0]); } catch (e) { next(e); } };
exports.updateProfile = async (req, res, next) => { try { const { name, phone, address } = req.body; if (!name || !/^\d{10,15}$/.test(phone)) return res.status(400).json({ message: 'Enter a name and valid phone number.' }); await db.execute('UPDATE users SET name=?, phone=?, address=? WHERE id=?', [name, phone, address || '', req.user.id]); res.json({ message: 'Profile updated.' }); } catch (e) { next(e); } };
exports.logout = (_req, res) => res.json({ message: 'Logged out. Remove the token from the client.' });
