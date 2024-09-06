// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findByUsername, findById, createUser } = require('../models/user');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();


// Register route
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await createUser(username, email, password, role);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await findByUsername(username);

  if (user && await bcrypt.compare(password, user.password)) {
    const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken
      });
  } else {
    res.status(401).send('Invalid credentials');
  }
});


// Logout route
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
