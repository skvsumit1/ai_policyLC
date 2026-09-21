const { readData, insertRecord } = require('../utils/fileStore');
const { createUser, validateUser } = require('../models/userModel');

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const users = readData('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  const { password: _, ...safeUser } = user;
  res.json({ message: 'Login successful', user: safeUser });
}

function getProfile(req, res) {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
}

function listUsers(req, res) {
  const users = readData('users.json').map(({ password, ...u }) => u);
  res.json(users);
}

function createUserHandler(req, res) {
  const errors = validateUser(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  const users = readData('users.json');
  if (users.find(u => u.email === req.body.email)) {
    return res.status(409).json({ error: 'Email already in use.' });
  }
  const user = createUser(req.body);
  insertRecord('users.json', user);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
}

module.exports = { login, getProfile, listUsers, createUserHandler };
