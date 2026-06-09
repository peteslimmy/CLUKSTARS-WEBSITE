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

router.get('/', authenticate, authorize('roles', 'list'), listRoles);
router.get('/:id', authenticate, authorize('roles', 'read'), getRole);
router.post('/', authenticate, authorize('roles', 'create'), createRole);
router.put('/:id', authenticate, authorize('roles', 'update'), updateRole);
router.delete('/:id', authenticate, authorize('roles', 'delete'), deleteRole);

export default router;
