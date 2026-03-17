const express = require('express');
const { login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;