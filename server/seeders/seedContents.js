const Content = require('../models/content');

async function seedContents() {
    await Content.bulkCreate([
        { user_id: 1, title: 'Campaign A', description: 'Deskripsi konten A', deadline: '2025-12-10', status: 'draft' },
        { user_id: 2, title: 'Konten IG Reels', description: 'Ide konten Reels', deadline: '2025-12-15', status: 'in_progress' }
    ]);
}

module.exports = seedContents;