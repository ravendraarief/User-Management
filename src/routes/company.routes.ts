import { Router } from 'express';
import { addCompany, getCompanies } from '../controllers/company.controller';
import { protect } from '../middlewares/auth.middleware';
import { isSuperAdmin } from '../middlewares/superadmin.middleware';

const router = Router();

router.get('/', protect, getCompanies);
router.post('/', protect, isSuperAdmin, addCompany);

export default router;
