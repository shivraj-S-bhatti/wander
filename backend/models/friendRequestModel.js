import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const COLLECTION = 'friend_requests';

export async function create(fromUserId, toUserId) {
  const db = getDb();
  const doc = {
    fromUserId: new ObjectId(fromUserId),
    toUserId: new ObjectId(toUserId),
    status: 'pending',
    createdAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc, status: 'pending' };
}

export async function findPendingBetween(fromUserId, toUserId) {
  const db = getDb();
  return db.collection(COLLECTION).findOne({
    fromUserId: new ObjectId(fromUserId),
    toUserId: new ObjectId(toUserId),
    status: 'pending',
  });
}

export async function findById(id) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function findReceivedPending(toUserId) {
  const db = getDb();
  return db
    .collection(COLLECTION)
    .find({ toUserId: new ObjectId(toUserId), status: 'pending' })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findSentPending(fromUserId) {
  const db = getDb();
  return db
    .collection(COLLECTION)
    .find({ fromUserId: new ObjectId(fromUserId), status: 'pending' })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function setStatus(id, status) {
  const db = getDb();
  if (!ObjectId.isValid(id)) return null;
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

const friendRequestModel = {
  create,
  findPendingBetween,
  findById,
  findReceivedPending,
  findSentPending,
  setStatus,
};
export { friendRequestModel };
