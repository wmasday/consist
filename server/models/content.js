const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Content = sequelize.define('Content', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(200) },
    description: { type: DataTypes.TEXT },
    deadline: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('draft', 'in_progress', 'done'), defaultValue: 'draft' }
});

User.hasMany(Content, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Content.belongsTo(User, { foreignKey: 'user_id' });


module.exports = Content;