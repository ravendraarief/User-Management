import * as express from 'express';
import {
  getUsers,
  register,
  login,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, getUsers);

export default router;
