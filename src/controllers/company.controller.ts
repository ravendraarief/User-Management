import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

// ➕ Superadmin Add Company
export const addCompany = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: 'Company name is required' });
    return;
  }

  // Cek jika sudah ada
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) {
    res.status(400).json({ message: 'Company already exists' });
    return;
  }

  // Tambah company
  const { data, error } = await supabase.from('companies').insert([{ name }]).select();

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(201).json({ message: 'Company created', company: data![0] });
};

// 🔍 Get Companies (Superadmin: semua, Admin: hanya miliknya)
export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  const currentUser = (req as any).user;

  let query = supabase.from('companies').select('id, name');

  // Jika bukan superadmin, hanya bisa lihat company miliknya
  if (currentUser.role !== 'superadmin' && currentUser.company?.name === 'Bitnusa') {
    query = query.eq('id', currentUser.company_id);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json(data);
};
