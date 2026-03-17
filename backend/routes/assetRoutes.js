const express = require('express');
const { getAssets, getAvailableAssetsByType, addAsset, updateAsset } = require('../controllers/assetController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAssets);
router.get('/available', auth, getAvailableAssetsByType);
router.post('/', auth, addAsset);
router.put('/:id', auth, updateAsset);

module.exports = router;