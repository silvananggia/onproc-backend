// backend/models/User.js
const db = require('../config/knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function findByUsername(username) {
  const user = await db('users').where({ username }).first();
  return user;
}

async function findById(id) {
  const user = await db('users').where({ id }).first();
  return user;
}

async function createUser(username, email, password, role = 'user') {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db('users').insert({
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    role,
  }).returning(['id', 'username', 'email', 'role']);
  return user;
}

module.exports = {
  findByUsername,
  findById,
  createUser,
};
