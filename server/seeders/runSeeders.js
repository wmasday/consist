const sequelize = require('../config/database');
const seedTeams = require('./seedTeams');
const seedUsers = require('./seedUsers');
const seedContents = require('./seedContents');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Seeding started...');
        await seedTeams();
        await seedUsers();
        await seedContents();
        console.log('Seeding completed successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();