import { friendRequestModel, userModel } from '../models/index.js';

export async function sendFriendRequest(req, res) {
  try {
    const userId = req.userId;
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({ error: 'toUserId is required' });
    }

    if (userId === toUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const toUser = await userModel.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = await friendRequestModel.findPendingBetween(userId, toUserId);
    if (existing) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    const reverse = await friendRequestModel.findPendingBetween(toUserId, userId);
    if (reverse) {
      return res.status(400).json({ error: 'They have already sent you a friend request. Accept it instead.' });
    }

    const fromUser = await userModel.findById(userId);
    const alreadyFriends = fromUser.friends?.some(
      (f) => f.toString() === toUserId
    );
    if (alreadyFriends) {
      return res.status(400).json({ error: 'Already friends' });
    }

    const request = await friendRequestModel.create(userId, toUserId);
    res.status(201).json({
      id: request._id.toString(),
      fromUserId: userId,
      toUserId,
      status: request.status,
      createdAt: request.createdAt,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }
    throw err;
  }
}

export async function listReceived(req, res) {
  const userId = req.userId;
  const requests = await friendRequestModel.findReceivedPending(userId);
  const withSenders = await Promise.all(
    requests.map(async (r) => {
      const from = await userModel.findById(r.fromUserId.toString());
      return {
        id: r._id.toString(),
        fromUserId: r.fromUserId.toString(),
        fromUsername: from?.username ?? null,
        status: r.status,
        createdAt: r.createdAt,
      };
    })
  );
  res.json(withSenders);
}

export async function listSent(req, res) {
  const userId = req.userId;
  const requests = await friendRequestModel.findSentPending(userId);
  const withReceivers = await Promise.all(
    requests.map(async (r) => {
      const to = await userModel.findById(r.toUserId.toString());
      return {
        id: r._id.toString(),
        toUserId: r.toUserId.toString(),
        toUsername: to?.username ?? null,
        status: r.status,
        createdAt: r.createdAt,
      };
    })
  );
  res.json(withReceivers);
}

export async function acceptFriendRequest(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  const request = await friendRequestModel.findById(id);
  if (!request) {
    return res.status(404).json({ error: 'Friend request not found' });
  }

  if (request.toUserId.toString() !== userId) {
    return res.status(403).json({ error: 'You can only accept requests sent to you' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Request is no longer pending' });
  }

  await friendRequestModel.setStatus(id, 'accepted');
  const fromUserId = request.fromUserId.toString();
  await userModel.addFriend(userId, fromUserId);

  res.json({
    id: request._id.toString(),
    status: 'accepted',
    message: 'You are now friends',
  });
}

export async function declineFriendRequest(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  const request = await friendRequestModel.findById(id);
  if (!request) {
    return res.status(404).json({ error: 'Friend request not found' });
  }

  if (request.toUserId.toString() !== userId) {
    return res.status(403).json({ error: 'You can only decline requests sent to you' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Request is no longer pending' });
  }

  await friendRequestModel.setStatus(id, 'declined');

  res.json({
    id: request._id.toString(),
    status: 'declined',
  });
}

export async function cancelFriendRequest(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  const request = await friendRequestModel.findById(id);
  if (!request) {
    return res.status(404).json({ error: 'Friend request not found' });
  }

  if (request.fromUserId.toString() !== userId) {
    return res.status(403).json({ error: 'You can only cancel requests you sent' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Request is no longer pending' });
  }

  await friendRequestModel.setStatus(id, 'cancelled');

  res.json({
    id: request._id.toString(),
    status: 'cancelled',
  });
}

const friendRequestController = {
  sendFriendRequest,
  listReceived,
  listSent,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
};
export { friendRequestController };
