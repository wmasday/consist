const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    register: async (req, res) => {
        try {
            const { full_name, email, password, team_id } = req.body;

            const existing = await User.findOne({ where: { email } });
            if (existing) return res.status(400).json({ message: 'Email already exists' });

            const hashed = await bcrypt.hash(password, 10);

            const user = await User.create({
                full_name,
                email,
                password: hashed,
                team_id
            });

            return res.json({ message: 'Registered successfully', user });
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

            const token = jwt.sign({ id: user.id, email: user.email }, 'SECRETKEY', { expiresIn: '1d' });

            return res.json({ message: 'Login successful', token });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
