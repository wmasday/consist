const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('consist', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});
module.exports = sequelize;