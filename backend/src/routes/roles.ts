import { Router } from 'express';
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/roles';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate as any, authorize('roles', 'list') as any, listRoles as any);
router.get('/:id', authenticate as any, authorize('roles', 'read') as any, getRole as any);
router.post('/', authenticate as any, authorize('roles', 'create') as any, createRole as any);
router.put('/:id', authenticate as any, authorize('roles', 'update') as any, updateRole as any);
router.delete('/:id', authenticate as any, authorize('roles', 'delete') as any, deleteRole as any);

export default router;
