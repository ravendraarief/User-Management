import * as express from 'express';
import {
  getUsers,
  register,
  login,
  createUser,
  updateUser
} from '../controllers/user.controller';
import { isSuperAdmin } from '../middlewares/superadmin.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, getUsers,);
router.post('/', protect, isSuperAdmin, createUser);
router.put('/:id', protect, isSuperAdmin, updateUser);

export default router;
