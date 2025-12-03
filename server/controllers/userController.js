const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = {
    getAll: async (req, res) => {
        try {
            const requester = req.user;

            if (requester.role === 'manager') {
                const users = await User.findAll({
                    attributes: { exclude: ['password'] }
                });
                return res.json(users);
            }

            // member: only see users in same team
            if (!requester.team_id) {
                return res.json([]);
            }

            const users = await User.findAll({
                where: { team_id: requester.team_id },
                attributes: { exclude: ['password'] }
            });
            return res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const requester = req.user;
            const user = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) return res.status(404).json({ message: 'User not found' });

            if (requester.role === 'manager') {
                return res.json(user);
            }

            // member: can only see if same team
            if (requester.team_id && requester.team_id === user.team_id) {
                return res.json(user);
            }

            return res.status(403).json({ message: 'Forbidden: cannot view this user' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can create users' });
            }

            const { full_name, email, password, team_id, role } = req.body;
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

            res.json({ message: 'User created', user: safeUser });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can update users' });
            }

            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const dataToUpdate = { ...req.body };

            if (dataToUpdate.password) {
                dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
            }

            if (dataToUpdate.role && !['manager', 'member'].includes(dataToUpdate.role)) {
                delete dataToUpdate.role;
            }

            await user.update(dataToUpdate);

            const safeUser = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                team_id: user.team_id,
                role: user.role
            };

            res.json({ message: 'User updated', user: safeUser });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can delete users' });
            }

            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            await user.destroy();
            res.json({ message: 'User deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
