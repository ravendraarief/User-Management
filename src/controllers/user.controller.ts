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

  // Ambil data perusahaan
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', user.company_id)
    .single();

  if (companyError || !company) {
    res.status(500).json({ message: 'Company not found' });
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      company,
    },
  });
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const currentUser = (req as any).user;

  let query = supabase
    .from('users')
    .select('id, username, email, role, status, company_id');

  if (!(currentUser.role === 'superadmin' && currentUser.company?.name === 'Bitnusa')) {
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

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, role, company_id, status } = req.body;

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
    res.status(400).json({ message: 'Email already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('users').insert([
    {
      username,
      email,
      password: hashedPassword,
      role,
      company_id,
      status: status || 'active',
    },
  ]);

  if (error) {
    res.status(500).json({ message: 'Failed to create user', error });
    return;
  }

  res.status(201).json({ message: 'User created successfully' });
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { username, email, password, role, company_id, status } = req.body;

  const updates: any = {
    ...(username && { username }),
    ...(email && { email }),
    ...(role && { role }),
    ...(company_id && { company_id }),
    ...(status && { status }),
  };

  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    res.status(500).json({ message: 'Failed to update user', error });
    return;
  }

  res.json({ message: 'User updated successfully' });
};

export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  const { data, error } = await supabase
    .from('users')
    .update({ status: 'inactive' })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ message: 'Failed to deactivate user', error: error.message });
    return;
  }

  res.json({ message: 'User deactivated successfully', user: data });
};

export const activateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  const { data, error } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ message: 'Failed to activate user', error: error.message });
    return;
  }

  res.json({ message: 'User activated successfully', user: data });
};