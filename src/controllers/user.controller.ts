import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { User, users } from '../models/user.model';
import { generateToken } from '../utils/jwt';

let userId = users.length + 1;

// 🔐 Register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, company } = req.body;

  if (!username || !email || !password || !role || !company) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: userId++,
    username,
    email,
    password: hashed,
    role,
    company,
    status: 'active',
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User registered',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company,
      status: newUser.status,
    },
    token: generateToken(newUser.id),
  });
};

// 🔐 Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.status === 'active');

  if (!user) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      company: user.company,
    },
    token: generateToken(user.id),
  });
};

// 🔍 Get All Users (filtered)
export const getUsers = (req: Request, res: Response): void => {
  const currentUser = (req as any).user;

  let result: User[];

  if (currentUser.company === 'Bitnusa' && currentUser.role === 'superadmin') {
    result = users;
  } else {
    result = users.filter(
      u => u.status === 'active' && (u.id === currentUser.id || u.company === currentUser.company)
    );
  }

  res.json(result.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    company: u.company,
    status: u.status,
  })));
};

// 🔍 Get One User by ID
export const getUserById = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    company: user.company,
    status: user.status,
  });
};

// ➕ Admin/Superadmin Create User
export const createUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, company } = req.body;
  const currentUser = (req as any).user;

  if (!username || !email || !password || !role || !company) {
    res.status(400).json({ message: 'All fields required' });
    return;
  }

  if (currentUser.role !== 'superadmin' && company !== currentUser.company) {
    res.status(403).json({ message: 'Cannot create user in another company' });
    return;
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: userId++,
    username,
    email,
    password: hashed,
    role,
    company,
    status: 'active',
  };

  users.push(newUser);
  res.status(201).json({ message: 'User created', user: newUser });
};

// ✏️ Update User
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { username, password, role } = req.body;
  const user = users.find(u => u.id === id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (username) user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (role) user.role = role;

  res.json({ message: 'User updated', user });
};

// ❌ Soft Delete User
export const deleteUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const currentUser = (req as any).user;

  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (currentUser.role !== 'superadmin' && user.company !== currentUser.company) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  user.status = 'inactive';
  res.json({ message: 'User set to inactive', user });
};
