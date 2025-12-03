const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Team = require('./team');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    team_id: { type: DataTypes.INTEGER, allowNull: true },
    full_name: { type: DataTypes.STRING(150) },
    email: { type: DataTypes.STRING(150), unique: true },
    password: { type: DataTypes.STRING(255) },
    role: {
        type: DataTypes.ENUM('manager', 'member'),
        allowNull: false,
        defaultValue: 'member'
    }
});

Team.hasMany(User, { foreignKey: 'team_id' });
User.belongsTo(Team, { foreignKey: 'team_id' });

module.exports = User;