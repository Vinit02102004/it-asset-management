const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const assetRoutes = require('./routes/assetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));