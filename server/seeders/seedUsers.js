const User = require('../models/user');
const bcrypt = require('bcrypt');

async function seedUsers() {
    await User.bulkCreate([
        { team_id: 1, full_name: 'Masday', email: 'masday@gmail.com', password: await bcrypt.hash('admin123', 10), role: 'manager' },
        { team_id: 1, full_name: 'Manager', email: 'manager@gmail.com', password: await bcrypt.hash('manager123', 10), role: 'manager' },
        { team_id: 1, full_name: 'Member', email: 'member@gmail.com', password: await bcrypt.hash('member123', 10), role: 'member' }
    ]);
}

module.exports = seedUsers;