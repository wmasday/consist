const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = {
    getAll: async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const { full_name, email, password, team_id } = req.body;
            const hashed = await bcrypt.hash(password, 10);
            const user = await User.create({ full_name, email, password: hashed, team_id });
            res.json({ message: 'User created', user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            await user.update(req.body);
            res.json({ message: 'User updated', user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            await user.destroy();
            res.json({ message: 'User deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
