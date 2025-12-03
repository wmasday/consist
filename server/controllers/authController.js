const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    register: async (req, res) => {
        try {
            const { full_name, email, password, team_id, role } = req.body;

            const existing = await User.findOne({ where: { email } });
            if (existing) return res.status(400).json({ message: 'Email already exists' });

            const hashed = await bcrypt.hash(password, 10);

            const user = await User.create({
                full_name,
                email,
                password: hashed,
                team_id,
                role: role === 'manager' ? 'manager' : 'member'
            });

            const safeUser = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                team_id: user.team_id,
                role: user.role
            };

            return res.json({ message: 'Registered successfully', user: safeUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(400).json({ message: 'Wrong password' });

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                team_id: user.team_id
            };

            const token = jwt.sign(payload, 'SECRETKEY', { expiresIn: '1d' });

            const safeUser = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                team_id: user.team_id,
                role: user.role
            };

            return res.json({ message: 'Login successful', token, user: safeUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
