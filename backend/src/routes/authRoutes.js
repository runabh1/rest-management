const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  login,
  verifyToken,
  getCurrentUser,
  createAdminUser
} = require('../controllers/authControllers');

// Public routes
router.post('/register', registerCustomer);
router.post('/login', login);
router.get('/verify', verifyToken);
router.post('/admin/setup', createAdminUser);

// Protected routes
router.get('/me', getCurrentUser);

module.exports = router;
