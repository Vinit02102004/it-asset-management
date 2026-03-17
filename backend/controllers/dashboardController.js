const db = require('../config/db');

exports.getAdminStats = async(req, res) => {
    try {
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
        res.json({
            total,
            pending,
            approvedNotCollected,
            inProgress,
            closed,
            cancelled
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};