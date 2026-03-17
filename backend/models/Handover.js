const db = require('../config/db');

class Handover {
    static async create(handoverData) {
        const { ticket_id, asset_id, handed_over_by, handed_over_to, handover_date, collection_date } = handoverData;
        const [result] = await db.query(
            `INSERT INTO handovers 
            (ticket_id, asset_id, handed_over_by, handed_over_to, handover_date, collection_date) 
            VALUES (?, ?, ?, ?, ?, ?)`, [ticket_id, asset_id, handed_over_by, handed_over_to, handover_date, collection_date]
        );
        return result.insertId;
    }

    static async findByTicketId(ticketId) {
        const [rows] = await db.query('SELECT * FROM handovers WHERE ticket_id = ?', [ticketId]);
        return rows;
    }

    static async findByAssetId(assetId) {
        const [rows] = await db.query('SELECT * FROM handovers WHERE asset_id = ?', [assetId]);
        return rows;
    }
}

module.exports = Handover;