// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase';
export type SupabaseUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  company_id: number;
  status: string;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, company_id } = req.body;

  if (typeof company_id !== 'string') {
    res.status(400).json({ message: 'Invalid company_id format (must be UUID string)' });
    return;
  }
  if (!username || !email || !password || !role || !company_id) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username,
        email,
        password: hashed,
        role,
        company_id,
        status: 'active',
      },
    ])
    .select();

  if (error || !data || data.length === 0) {
    console.error('Supabase error:', error); 
    res.status(500).json({ message: error?.message || 'Failed to create user' });
    return;
  }

  const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.status(201).json({ message: 'User registered', user: data[0], token });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .single();

  if (error || !user) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.json({ message: 'Login successful', user, token });
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const currentUser = (req as any).user;

  let query = supabase
    .from('users')
    .select('id, username, email, role, status, company_id');

  if (!(currentUser.role === 'superadmin' && currentUser.company === 'Bitnusa')) {
    query = query
      .eq('company_id', currentUser.company_id)
      .eq('status', 'active');
  }

  const { data, error } = await query;

  if (error || !data) {
    res.status(500).json({ message: error?.message || 'Failed to fetch users' });
    return;
  }

  res.json(data);
};
