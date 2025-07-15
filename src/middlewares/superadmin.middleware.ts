import { Request, Response, NextFunction } from 'express';

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (
    (user?.role === 'superadmin' && user?.company?.name === 'Bitnusa') ||
    user?.role === 'admin'
  ) {
    return next();
  }

  res.status(403).json({ message: 'Only superadmin allowed' });
};
