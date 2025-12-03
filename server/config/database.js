const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('btsuq9tevk6yesdfwjop', 'u4moe2w2qs8hf2mw', 'BTPpWsqpRW6X6xCGND7b', {
    host: 'btsuq9tevk6yesdfwjop-mysql.services.clever-cloud.com',
    dialect: 'mysql',
});
module.exports = sequelize;