const users = [
  { id: '1', username: 'Alex', civicScore: 320, streak: 7, rank: 1 },
  { id: '2', username: 'Sam', civicScore: 280, streak: 5, rank: 2 },
];

let nextId = 3;

export function getAll() {
  return users;
}

export function create(user) {
  const newUser = { id: String(nextId++), ...user };
  users.push(newUser);
  return newUser;
}

const userModel = { getAll, create };
export { userModel };
