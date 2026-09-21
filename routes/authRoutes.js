const express = require('express');
const router = express.Router();
const { login, getProfile, listUsers, createUserHandler } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', requireAuth, getProfile);
router.get('/users', requireAuth, requireRole('admin'), listUsers);
router.post('/users', requireAuth, requireRole('admin'), createUserHandler);

module.exports = router;
