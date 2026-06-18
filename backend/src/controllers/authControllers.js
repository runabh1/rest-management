const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../config/database');
const { Customer } = require('../models');
const { generateId } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register Customer
exports.registerCustomer = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    const customer = await Customer.create(name, phone, email, '');

    // Create user
    await dbRun(
      'INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, phone, 'customer']
    );

    // Generate token
    const token = jwt.sign({ id: userId, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: { id: userId, email, name, phone, role: 'customer', customerId: customer.id }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login (Customer or Admin)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = await dbGet('SELECT * FROM users WHERE email = ? AND role = ?', [email, role || 'customer']);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const customer = user.role === 'customer'
      ? await dbGet('SELECT id FROM customer WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 1', [user.email])
      : null;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        customerId: customer?.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, email, name, phone, role FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, email, name, phone, role FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Create Admin User (for setup only)
exports.createAdminUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if admin exists
    const existingAdmin = await dbGet('SELECT id FROM users WHERE email = ? AND role = ?', [email, 'admin']);
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = generateId();

    // Create admin user
    await dbRun(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, email, hashedPassword, name, 'admin']
    );

    res.status(201).json({
      message: 'Admin user created successfully',
      user: { id: adminId, email, name, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
