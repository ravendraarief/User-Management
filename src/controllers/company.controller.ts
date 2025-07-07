import { Request, Response } from 'express';
import { companies, Company } from '../models/company.model';

let companyId = companies.length + 1;

export const addCompany = (req: Request, res: Response): void => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: 'Company name is required' });
    return;
  }

  const exists = companies.find(c => c.name === name);
  if (exists) {
    res.status(400).json({ message: 'Company already exists' });
    return;
  }

  const newCompany: Company = { id: companyId++, name };
  companies.push(newCompany);

  res.status(201).json({ message: 'Company created', company: newCompany });
};
