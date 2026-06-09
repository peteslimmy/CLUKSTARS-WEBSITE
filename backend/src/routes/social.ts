import { Router } from 'express';
import {
  listSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/social';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listSocialLinks as any);
router.post('/', authenticate as any, authorize('social', 'create') as any, createSocialLink as any);
router.put('/:id', authenticate as any, authorize('social', 'update') as any, updateSocialLink as any);
router.delete('/:id', authenticate as any, authorize('social', 'delete') as any, deleteSocialLink as any);

export default router;
