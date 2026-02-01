import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from root (parent of backend)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
let client;
let db;

export async function connectDB() {
  if (!uri) {
    throw new Error('MONGO_URI or MONGODB_URI must be set in .env');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });
  // Ensure existing users have friends array and civicPoints
  await users.updateMany({ friends: { $exists: false } }, { $set: { friends: [] } });
  await users.updateMany({ civicPoints: { $exists: false } }, { $set: { civicPoints: 0 } });
  await users.updateMany({ streak: { $exists: false } }, { $set: { streak: 0 } });

  const friendRequests = db.collection('friend_requests');
  await friendRequests.createIndex(
    { fromUserId: 1, toUserId: 1 },
    { unique: true }
  );
  await friendRequests.createIndex({ toUserId: 1, status: 1 });
  await friendRequests.createIndex({ fromUserId: 1, status: 1 });

  console.log('MongoDB connected');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB disconnected');
  }
}
