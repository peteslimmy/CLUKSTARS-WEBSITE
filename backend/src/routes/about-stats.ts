import { Router } from 'express';
import { listAboutStats, getAboutStat, createAboutStat, updateAboutStat, deleteAboutStat } from '../controllers/about-stats';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('about-stats', 'list'), listAboutStats);
router.get('/:id', authenticate, authorize('about-stats', 'read'), getAboutStat);
router.post('/', authenticate, authorize('about-stats', 'create'), createAboutStat);
router.put('/:id', authenticate, authorize('about-stats', 'update'), updateAboutStat);
router.delete('/:id', authenticate, authorize('about-stats', 'delete'), deleteAboutStat);
export default router;
