const db = require('../config/db');

class Return {
    static async create(returnData) {
        const { ticket_id, asset_id, returned_date, condition_notes, returned_to } = returnData;
        const [result] = await db.query(
            `INSERT INTO returns 
            (ticket_id, asset_id, returned_date, condition_notes, returned_to) 
            VALUES (?, ?, ?, ?, ?)`, [ticket_id, asset_id, returned_date, condition_notes, returned_to]
        );
        return result.insertId;
    }

    static async findByTicketId(ticketId) {
        const [rows] = await db.query('SELECT * FROM returns WHERE ticket_id = ?', [ticketId]);
        return rows;
    }
}

module.exports = Return;