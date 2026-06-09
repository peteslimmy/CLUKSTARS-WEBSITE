import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('users', 'list'), listUsers);
router.get('/:id', authenticate, authorize('users', 'read'), getUser);
router.post('/', authenticate, authorize('users', 'create'), createUser);
router.put('/:id', authenticate, authorize('users', 'update'), updateUser);
router.delete('/:id', authenticate, authorize('users', 'delete'), deleteUser);

export default router;
