const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async(req, res) => {
    const { employeeId, password, role } = req.body;
    try {
        // Find user by employee ID using the model
        const user = await User.findByEmployeeId(employeeId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If the user is an admin, verify password
        if (user.role === 'admin') {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }
        // For employees, password is optional (skip validation)

        // Generate JWT token
        const token = jwt.sign({
                id: user.id,
                employeeId: user.employee_id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET, { expiresIn: '1d' }
        );

        // Return token and user info (excluding password)
        res.json({
            token,
            user: {
                id: user.id,
                employeeId: user.employee_id,
                name: user.name,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async(req, res) => {
    try {
        // Fetch current user using the model
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};