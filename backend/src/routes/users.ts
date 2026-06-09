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

router.get('/', authenticate as any, authorize('users', 'list') as any, listUsers as any);
router.get('/:id', authenticate as any, authorize('users', 'read') as any, getUser as any);
router.post('/', authenticate as any, authorize('users', 'create') as any, createUser as any);
router.put('/:id', authenticate as any, authorize('users', 'update') as any, updateUser as any);
router.delete('/:id', authenticate as any, authorize('users', 'delete') as any, deleteUser as any);

export default router;
