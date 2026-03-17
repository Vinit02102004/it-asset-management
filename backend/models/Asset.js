const db = require('../config/db');

class Asset {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM assets ORDER BY created_at DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByAssetId(assetId) {
        const [rows] = await db.query('SELECT * FROM assets WHERE asset_id = ?', [assetId]);
        return rows[0];
    }

    static async findAvailableByType(assetType) {
        const [rows] = await db.query('SELECT * FROM assets WHERE asset_type = ? AND status = "Available"', [assetType]);
        return rows;
    }

    static async create(assetData) {
        const { asset_id, asset_type, serial_number, status, location, purchase_date, notes, last_checked } = assetData;
        const [result] = await db.query(
            `INSERT INTO assets 
            (asset_id, asset_type, serial_number, status, location, purchase_date, notes, last_checked) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [asset_id, asset_type, serial_number, status, location, purchase_date, notes, last_checked]
        );
        return result.insertId;
    }

    static async update(id, fields) {
        const allowedFields = ['serial_number', 'status', 'location', 'notes', 'last_checked'];
        const updates = [];
        const values = [];
        for (const [key, value] of Object.entries(fields)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (updates.length === 0) return;
        values.push(id);
        await db.query(`UPDATE assets SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    static async updateStatus(id, status) {
        await db.query('UPDATE assets SET status = ? WHERE id = ?', [status, id]);
    }
}

module.exports = Asset;