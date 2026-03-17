const express = require('express');
const { getAdminStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/admin/stats', auth, getAdminStats);

module.exports = router;