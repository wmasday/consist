const Content = require('../models/content');

module.exports = {
    getOwnContents: async (req, res) => {
        try {
            const user_id = req.user.id;
            const contents = await Content.findAll({ where: { user_id } });
            res.json(contents);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const user_id = req.user.id;
            const content = await Content.findOne({ where: { id: req.params.id, user_id } });
            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });
            res.json(content);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { title, description, deadline, status } = req.body;
            const content = await Content.create({ user_id, title, description, deadline, status });
            res.json({ message: 'Content created', content });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const user_id = req.user.id;
            const content = await Content.findOne({ where: { id: req.params.id, user_id } });
            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.update(req.body);
            res.json({ message: 'Content updated', content });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            const user_id = req.user.id;
            const content = await Content.findOne({ where: { id: req.params.id, user_id } });
            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.destroy();
            res.json({ message: 'Content deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
