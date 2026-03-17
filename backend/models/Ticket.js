const db = require('../config/db');

class Ticket {
    static async findAll(filters = {}) {
        let query = `
            SELECT t.*, u.name as employee_name, u.employee_id, a.asset_id as approved_asset_code
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN assets a ON t.approved_asset_id = a.id
        `;
        const conditions = [];
        const values = [];

        if (filters.userId) {
            conditions.push('t.user_id = ?');
            values.push(filters.userId);
        }
        if (filters.status) {
            conditions.push('t.status = ?');
            values.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY t.request_date DESC';

        const [rows] = await db.query(query, values);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT t.*, u.name as employee_name, u.employee_id, a.asset_id as approved_asset_code
             FROM tickets t
             JOIN users u ON t.user_id = u.id
             LEFT JOIN assets a ON t.approved_asset_id = a.id
             WHERE t.id = ?`, [id]
        );
        return rows[0];
    }

    static async findByTicketId(ticketId) {
        const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
        return rows[0];
    }

    static async create(ticketData) {
        const { ticket_id, user_id, asset_type_requested, purpose, request_date, expected_return_date, status } = ticketData;
        const [result] = await db.query(
            `INSERT INTO tickets 
            (ticket_id, user_id, asset_type_requested, purpose, request_date, expected_return_date, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [ticket_id, user_id, asset_type_requested, purpose, request_date, expected_return_date, status]
        );
        return result.insertId;
    }

    static async update(id, fields) {
        const allowedFields = ['status', 'approved_asset_id'];
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
        await db.query(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    static async updateStatus(id, status) {
        await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    }

    static async getStats() {
        const [
            [{ total }]
        ] = await db.query('SELECT COUNT(*) as total FROM tickets');
        const [
            [{ pending }]
        ] = await db.query('SELECT COUNT(*) as pending FROM tickets WHERE status = "Pending"');
        const [
            [{ approvedNotCollected }]
        ] = await db.query('SELECT COUNT(*) as approvedNotCollected FROM tickets WHERE status = "Approved – Not Collected"');
        const [
            [{ inProgress }]
        ] = await db.query('SELECT COUNT(*) as inProgress FROM tickets WHERE status = "In Progress"');
        const [
            [{ closed }]
        ] = await db.query('SELECT COUNT(*) as closed FROM tickets WHERE status = "Closed"');
        const [
            [{ cancelled }]
        ] = await db.query('SELECT COUNT(*) as cancelled FROM tickets WHERE status = "Cancelled"');
        return { total, pending, approvedNotCollected, inProgress, closed, cancelled };
    }
}

module.exports = Ticket;