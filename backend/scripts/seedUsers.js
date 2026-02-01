/**
 * Seed script: creates 20 dummy users, friend relationships, and pending friend requests.
 * Run from backend: node scripts/seedUsers.js
 * Requires: MONGO_URI or MONGODB_URI in .env (parent folder)
 *
 * All seed users have password: password123
 * Emails: seed1@example.com ... seed20@example.com
 */

import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB, getDb } from '../db.js';
import { userModel, friendRequestModel } from '../models/index.js';

const SALT_ROUNDS = 10;
const PASSWORD = 'password123';

const DUMMY_NAMES = [
  'Alex Rivera', 'Jordan Lee', 'Sam Chen', 'Riley Park', 'Casey Morgan',
  'Taylor Kim', 'Quinn Davis', 'Avery Brown', 'Morgan Taylor', 'Skyler Jones',
  'Parker White', 'Dakota Clark', 'Reese Martinez', 'Cameron Wilson', 'Finley Moore',
  'Emerson Hall', 'Hayden Lewis', 'Blake Young', 'Rowan King', 'Sage Wright',
];

function usernameFromName(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickPairs(ids, count) {
  const pairs = new Set();
  const shuffled = shuffle(ids);
  let attempts = 0;
  while (pairs.size < count && attempts < 500) {
    const a = shuffled[randomInt(0, ids.length - 1)];
    const b = shuffled[randomInt(0, ids.length - 1)];
    if (a !== b) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      pairs.add(key);
    }
    attempts++;
  }
  return [...pairs].map((key) => key.split('-'));
}

async function main() {
  console.log('Connecting to DB...');
  await connectDB();

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
  const userIds = [];

  console.log('Creating 20 users...');
  for (let i = 0; i < 20; i++) {
    const name = DUMMY_NAMES[i];
    const username = `${usernameFromName(name)}_${i + 1}`;
    const email = `seed${i + 1}@example.com`;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      userIds.push(existing._id.toString());
      console.log(`  Skip (exists): ${email}`);
      continue;
    }

    const user = await userModel.create({ username, email, passwordHash });
    userIds.push(user._id.toString());
    console.log(`  Created: ${username} (${email})`);
  }

  const db = getDb();
  console.log('Setting random civic points (50–400)...');
  for (const id of userIds) {
    const civicPoints = randomInt(50, 400);
    const streak = randomInt(0, 14);
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { civicPoints, streak } }
    );
  }

  console.log('Adding friends (~25 pairs)...');
  const friendPairs = pickPairs(userIds, 25);
  const friendSet = new Set();
  for (const [a, b] of friendPairs) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (friendSet.has(key)) continue;
    friendSet.add(key);
    try {
      await userModel.addFriend(a, b);
      console.log(`  Friends: ${a.slice(-6)} <-> ${b.slice(-6)}`);
    } catch (e) {
      console.warn(`  Skip friend pair (maybe exists): ${e.message}`);
    }
  }

  // Refresh friends map after adding friends
  const usersWithFriends2 = await db
    .collection('users')
    .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
    .toArray();
  const friendsByUser = new Map();
  for (const u of usersWithFriends2) {
    const id = u._id.toString();
    friendsByUser.set(id, new Set((u.friends || []).map((f) => f.toString())));
  }

  console.log('Creating pending friend requests (~12)...');
  let requestsCreated = 0;
  const requestAttempts = 60;
  for (let n = 0; n < requestAttempts && requestsCreated < 12; n++) {
    const from = userIds[randomInt(0, userIds.length - 1)];
    const to = userIds[randomInt(0, userIds.length - 1)];
    if (from === to) continue;
    const fromFriends = friendsByUser.get(from);
    if (fromFriends && fromFriends.has(to)) continue;
    const existing = await friendRequestModel.findPendingBetween(from, to);
    if (existing) continue;
    const reverse = await friendRequestModel.findPendingBetween(to, from);
    if (reverse) continue;
    try {
      await friendRequestModel.create(from, to);
      requestsCreated++;
      console.log(`  Request: ${from.slice(-4)} -> ${to.slice(-4)}`);
    } catch (e) {
      if (e.code !== 11000) console.warn(e.message);
    }
  }

  console.log('Done.');
  console.log(`  Users: ${userIds.length}`);
  console.log(`  Friend pairs: ${friendSet.size}`);
  console.log(`  Pending requests: ${requestsCreated}`);
  console.log('  Login with any seed user: seed1@example.com ... seed20@example.com / password123');

  await closeDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
