const express = require('express');
const { getTickets, createTicket, updateTicketStatus, handover, returnAsset } = require('../controllers/ticketController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getTickets);
router.post('/', auth, createTicket);
router.put('/:id/status', auth, updateTicketStatus);
router.post('/handover', auth, handover);
router.post('/return', auth, returnAsset);

module.exports = router;