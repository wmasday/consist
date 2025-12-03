const Team = require('../models/team');

async function seedTeams() {
    await Team.bulkCreate([
        { name: 'Marketing' },
        { name: 'Creative' },
        { name: 'Social Media' }
    ]);
}

module.exports = seedTeams;