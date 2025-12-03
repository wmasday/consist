const Content = require('../models/content');
const ContentAI = require('../models/content_ai');
const deepseek = require('../utils/deepseekClient');
const User = require('../models/user');

module.exports = {
    getOwnContents: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            let contents;
            if (role === 'manager') {
                contents = await Content.findAll({
                    include: [{ model: User, attributes: ['id', 'full_name', 'email', 'team_id'] }]
                });
            } else {
                contents = await Content.findAll({ where: { user_id } });
            }

            res.json(contents);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getOne: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({
                where,
                include: [{
                    model: ContentAI,
                    as: 'ai_logs',
                    attributes: ['id', 'type', 'ai_response', 'createdAt']
                }]
            });

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

            const content = await Content.create({
                user_id,
                title,
                description,
                deadline,
                status
            });

            const ai_text = await deepseek.generateSummary(
                `Title: ${title}\nDescription: ${description}`
            );

            await ContentAI.create({
                user_id,
                content_id: content.id,
                type: 'summary',
                ai_response: ai_text
            });

            res.json({
                message: 'Content created with AI summary',
                content,
                ai_summary: ai_text
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({ where });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.update(req.body);
            const ai_text = await deepseek.generateSummary(
                `Updated Content:\nTitle: ${content.title}\nDescription: ${content.description}`
            );

            await ContentAI.create({
                user_id,
                content_id: content.id,
                type: 'summary',
                ai_response: ai_text
            });

            res.json({
                message: 'Content updated with new AI summary',
                content,
                ai_summary: ai_text
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            const { id: user_id, role } = req.user;

            const where = role === 'manager'
                ? { id: req.params.id }
                : { id: req.params.id, user_id };

            const content = await Content.findOne({ where });

            if (!content) return res.status(404).json({ message: 'Content not found or not yours' });

            await content.destroy();

            res.json({ message: 'Content deleted (AI logs removed too)' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
