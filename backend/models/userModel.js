import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const COLLECTION = 'users';

export async function findByEmail(email) {
  const db = getDb();
  return db.collection(COLLECTION).findOne({ email });
}

export async function findByUsername(username) {
  const db = getDb();
  return db.collection(COLLECTION).findOne({ username });
}

export async function findById(id) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function create({ username, email, passwordHash }) {
  const db = getDb();
  const doc = { username, email, password: passwordHash, friends: [], civicPoints: 0, streak: 0 };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, username, email, friends: [], civicPoints: 0, streak: 0 };
}

export async function getAll() {
  const db = getDb();
  return db.collection(COLLECTION).find({}, { projection: { password: 0 } }).toArray();
}

export async function searchByUsername(partial, limit = 20) {
  const db = getDb();
  if (!partial || typeof partial !== 'string' || partial.trim() === '') {
    return [];
  }
  const regex = new RegExp(partial.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return db
    .collection(COLLECTION)
    .find({ username: regex }, { projection: { password: 0 } })
    .limit(limit)
    .toArray();
}

export async function addFriend(userId, friendId) {
  const db = getDb();
  const uid = new ObjectId(userId);
  const fid = new ObjectId(friendId);
  await db.collection(COLLECTION).updateOne(
    { _id: uid },
    { $addToSet: { friends: fid } }
  );
  await db.collection(COLLECTION).updateOne(
    { _id: fid },
    { $addToSet: { friends: uid } }
  );
}

const userModel = { findByEmail, findByUsername, findById, create, getAll, addFriend, searchByUsername };
export { userModel };
