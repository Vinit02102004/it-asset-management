const db = require('../config/db');

class User {
    static async findAll() {
        const [rows] = await db.query('SELECT id, employee_id, name, role, department, created_at FROM users');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id, employee_id, name, role, department, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByEmployeeId(employeeId) {
        const [rows] = await db.query('SELECT * FROM users WHERE employee_id = ?', [employeeId]);
        return rows[0];
    }

    static async create(employeeId, name, password, role, department) {
        const [result] = await db.query(
            'INSERT INTO users (employee_id, name, password, role, department) VALUES (?, ?, ?, ?, ?)', [employeeId, name, password, role, department]
        );
        return result.insertId;
    }

    static async update(id, fields) {
        const allowedFields = ['name', 'password', 'role', 'department'];
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
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }
}

module.exports = User;