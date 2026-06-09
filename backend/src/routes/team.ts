import { Router } from 'express';
import { listTeam, getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/team';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('team', 'list'), listTeam);
router.get('/:id', authenticate, authorize('team', 'read'), getTeam);
router.post('/', authenticate, authorize('team', 'create'), createTeam);
router.put('/:id', authenticate, authorize('team', 'update'), updateTeam);
router.delete('/:id', authenticate, authorize('team', 'delete'), deleteTeam);

export default router;
