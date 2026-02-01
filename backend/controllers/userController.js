import { userModel } from '../models/index.js';

export function getUsers(req, res) {
  const users = userModel.getAll();
  res.json(users);
}

export function createUser(req, res) {
  const { username, civicScore, streak, rank } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'username is required' });
  }
  const user = userModel.create({ username, civicScore, streak, rank });
  res.status(201).json(user);
}

const userController = { getUsers, createUser };
export { userController };
