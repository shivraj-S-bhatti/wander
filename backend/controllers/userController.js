import { userModel } from '../models/index.js';

export async function getUsers(req, res) {
  const users = await userModel.getAll();
  res.json(users);
}

const userController = { getUsers };
export { userController };
