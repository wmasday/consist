const Team = require('../models/team');

module.exports = {
    getAll: async (req, res) => {
        try {
            const requester = req.user;

            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can view teams' });
            }

            const teams = await Team.findAll();
            res.json(teams);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const requester = req.user;

            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can view teams' });
            }

            const team = await Team.findByPk(req.params.id);
            if (!team) return res.status(404).json({ message: 'Team not found' });
            res.json(team);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can create teams' });
            }

            const { name } = req.body;
            const team = await Team.create({ name });
            res.json({ message: 'Team created', team });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can update teams' });
            }

            const team = await Team.findByPk(req.params.id);
            if (!team) return res.status(404).json({ message: 'Team not found' });

            await team.update(req.body);
            res.json({ message: 'Team updated', team });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            const requester = req.user;
            if (requester.role !== 'manager') {
                return res.status(403).json({ message: 'Only manager can delete teams' });
            }

            const team = await Team.findByPk(req.params.id);
            if (!team) return res.status(404).json({ message: 'Team not found' });

            await team.destroy();
            res.json({ message: 'Team deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
