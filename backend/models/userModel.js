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

export async function create({ username, email, passwordHash }) {
  const db = getDb();
  const doc = { username, email, password: passwordHash };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, username, email };
}

export async function getAll() {
  const db = getDb();
  return db.collection(COLLECTION).find({}, { projection: { password: 0 } }).toArray();
}

const userModel = { findByEmail, findByUsername, create, getAll };
export { userModel };
