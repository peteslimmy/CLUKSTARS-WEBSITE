import { Router } from 'express';
import {
  listSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/social';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listSocialLinks);
router.post('/', authenticate, authorize('social', 'create'), createSocialLink);
router.put('/:id', authenticate, authorize('social', 'update'), updateSocialLink);
router.delete('/:id', authenticate, authorize('social', 'delete'), deleteSocialLink);

export default router;
