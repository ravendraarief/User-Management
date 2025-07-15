import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Ambil user dari Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (userError || !user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    

    // Ambil company dari Supabase
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', user.company_id)
      .single();

    if (companyError || !company) {
      res.status(401).json({ message: 'Company not found' });
      return;
    }

    // Simpan user dan company di request object
    (req as any).user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      company,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
