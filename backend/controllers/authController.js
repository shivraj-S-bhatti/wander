import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

function toSafeUser(user) {
  if (!user) return null;
  const id = user._id ? user._id.toString() : user.id;
  return { id, username: user.username, email: user.email };
}

function signToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username taken' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ username, email, passwordHash });
    const payload = { userId: user._id.toString(), email: user.email };
    const token = signToken(payload);
    return res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err) {
    if (err.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    throw err;
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const payload = { userId: user._id.toString(), email: user.email };
    const token = signToken(payload);
    return res.status(200).json({ token, user: toSafeUser(user) });
  } catch (err) {
    if (err.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    throw err;
  }
}

const authController = { signup, login };
export { authController };
