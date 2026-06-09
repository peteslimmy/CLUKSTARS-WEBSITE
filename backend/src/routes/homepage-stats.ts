import { Router } from 'express';
import { listHomepageStats, getHomepageStat, createHomepageStat, updateHomepageStat, deleteHomepageStat } from '../controllers/homepage-stats';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('homepage-stats', 'list'), listHomepageStats);
router.get('/:id', authenticate, authorize('homepage-stats', 'read'), getHomepageStat);
router.post('/', authenticate, authorize('homepage-stats', 'create'), createHomepageStat);
router.put('/:id', authenticate, authorize('homepage-stats', 'update'), updateHomepageStat);
router.delete('/:id', authenticate, authorize('homepage-stats', 'delete'), deleteHomepageStat);
export default router;
