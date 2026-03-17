const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ?
        authHeader.replace('Bearer ', '') :
        null;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};