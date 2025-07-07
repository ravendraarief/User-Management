import * as express from 'express';
import { addCompany } from '../controllers/company.controller';
import { protect } from '../middlewares/auth.middleware';
import { isSuperAdmin } from '../middlewares/superadmin.middleware';

const router = express.Router();
router.post('/', protect, isSuperAdmin, addCompany);
export default router;
