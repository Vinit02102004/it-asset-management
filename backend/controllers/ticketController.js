const db = require('../config/db');

// Get all tickets (admin) or user tickets (employee)
exports.getTickets = async(req, res) => {
    try {
        let query = `
            SELECT t.*, u.name as employee_name, u.employee_id, a.asset_id as approved_asset_code
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN assets a ON t.approved_asset_id = a.id
        `;
        const params = [];
        if (req.user.role === 'employee') {
            query += ' WHERE t.user_id = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY t.request_date DESC';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new ticket (employee)
exports.createTicket = async(req, res) => {
    const { assetType, purpose, expectedReturnDate } = req.body;
    const userId = req.user.id;
    const ticketId = 'TKT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const requestDate = new Date();
    try {
        const [result] = await db.query(
            'INSERT INTO tickets (ticket_id, user_id, asset_type_requested, purpose, request_date, expected_return_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [ticketId, userId, assetType, purpose, requestDate, expectedReturnDate, 'Pending']
        );
        res.status(201).json({ message: 'Ticket created', ticketId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update ticket status (admin)
exports.updateTicketStatus = async(req, res) => {
    const { id } = req.params;
    const { status, assetId, reason } = req.body;
    try {
        if (status === 'Approved – Not Collected') {
            if (assetId) {
                await db.query('UPDATE tickets SET status = ?, approved_asset_id = ? WHERE id = ?', [status, assetId, id]);
            } else {
                await db.query('UPDATE tickets SET status = ?, approved_asset_id = NULL WHERE id = ?', [status, id]);
            }
        } else if (status === 'Cancelled' && reason) {
            await db.query('UPDATE tickets SET status = ?, rejection_reason = ? WHERE id = ?', [status, reason, id]);
        } else {
            await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
        }
        res.json({ message: 'Ticket updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Handover: create handover record and update ticket/asset
exports.handover = async(req, res) => {
    const { ticketId, assetId, employeeId } = req.body;
    const adminId = req.user.id;
    const handoverDate = new Date();
    try {
        // Insert handover
        await db.query(
            'INSERT INTO handovers (ticket_id, asset_id, handed_over_by, handed_over_to, handover_date, collection_date) VALUES (?, ?, ?, ?, ?, ?)', [ticketId, assetId, adminId, employeeId, handoverDate, handoverDate]
        );
        // Update ticket status to 'In Progress'
        await db.query('UPDATE tickets SET status = ? WHERE id = ?', ['In Progress', ticketId]);
        // Update asset status to 'In Use'
        await db.query('UPDATE assets SET status = ? WHERE id = ?', ['In Use', assetId]);
        res.json({ message: 'Handover completed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Return asset: create return record and update ticket/asset
exports.returnAsset = async(req, res) => {
    const { ticketId, assetId, conditionNotes } = req.body;
    const adminId = req.user.id;
    const returnedDate = new Date();
    try {
        // Insert return
        await db.query(
            'INSERT INTO returns (ticket_id, asset_id, returned_date, condition_notes, returned_to) VALUES (?, ?, ?, ?, ?)', [ticketId, assetId, returnedDate, conditionNotes, adminId]
        );
        // Update ticket status to 'Closed'
        await db.query('UPDATE tickets SET status = ? WHERE id = ?', ['Closed', ticketId]);
        // Update asset status to 'Available'
        await db.query('UPDATE assets SET status = ? WHERE id = ?', ['Available', assetId]);
        res.json({ message: 'Return recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};