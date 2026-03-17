const db = require('../config/db');

// Get all assets
exports.getAssets = async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM assets ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get available assets by type
exports.getAvailableAssetsByType = async(req, res) => {
    const { type } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM assets WHERE asset_type = ? AND status = "Available"', [type]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add new asset
exports.addAsset = async(req, res) => {
    const { assetType, serialNumber, status, location, purchaseDate, notes } = req.body;
    // Generate asset ID (e.g., AST-XXX001)
    const prefix = assetType.substring(0, 3).toUpperCase();
    const [rows] = await db.query('SELECT COUNT(*) as count FROM assets WHERE asset_type = ?', [assetType]);
    const count = rows[0].count + 1;
    const assetId = `AST-${prefix}${count.toString().padStart(3, '0')}`;
    const lastChecked = new Date().toISOString().split('T')[0];
    try {
        await db.query(
            'INSERT INTO assets (asset_id, asset_type, serial_number, status, location, purchase_date, notes, last_checked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [assetId, assetType, serialNumber, status || 'Available', location, purchaseDate, notes, lastChecked]
        );
        res.status(201).json({ message: 'Asset added', assetId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update asset
exports.updateAsset = async(req, res) => {
    const { id } = req.params;
    const { serialNumber, status, location, notes } = req.body;
    const lastChecked = new Date().toISOString().split('T')[0];
    try {
        await db.query(
            'UPDATE assets SET serial_number = ?, status = ?, location = ?, notes = ?, last_checked = ? WHERE id = ?', [serialNumber, status, location, notes, lastChecked, id]
        );
        res.json({ message: 'Asset updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};