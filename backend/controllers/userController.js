import { userModel } from '../models/index.js';

export async function getUsers(req, res) {
  const users = await userModel.getAll();
  res.json(users);
}

export async function searchUsers(req, res) {
  const q = req.query.q ?? req.query.username ?? '';
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const users = await userModel.searchByUsername(q, limit);
  const safe = users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    friends: (u.friends || []).map((f) => (typeof f === 'string' ? f : f.toString())),
    civicPoints: typeof u.civicPoints === 'number' ? u.civicPoints : 0,
    streak: typeof u.streak === 'number' ? u.streak : 0,
  }));
  res.json(safe);
}

export async function getFriends(req, res) {
  const userId = req.params.userId || req.userId;
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const friendIds = (user.friends || []).map((f) => f.toString());
  const friends = await Promise.all(
    friendIds.map(async (id) => {
      const u = await userModel.findById(id);
      if (!u) return null;
      return {
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        civicPoints: typeof u.civicPoints === 'number' ? u.civicPoints : 0,
        streak: typeof u.streak === 'number' ? u.streak : 0,
      };
    })
  );
  res.json(friends.filter(Boolean));
}

const userController = { getUsers, getFriends, searchUsers };
export { userController };
