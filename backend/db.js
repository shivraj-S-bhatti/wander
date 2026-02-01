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
