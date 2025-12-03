const sequelize = require('../config/database');
const Team = require('../models/team');
const User = require('../models/user');
const Content = require('../models/content');

(async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Migrations completed successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();