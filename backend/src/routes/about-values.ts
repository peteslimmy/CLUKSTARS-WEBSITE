import { Router } from 'express';
import { listAboutValues, getAboutValue, createAboutValue, updateAboutValue, deleteAboutValue } from '../controllers/about-values';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('about-values', 'list'), listAboutValues);
router.get('/:id', authenticate, authorize('about-values', 'read'), getAboutValue);
router.post('/', authenticate, authorize('about-values', 'create'), createAboutValue);
router.put('/:id', authenticate, authorize('about-values', 'update'), updateAboutValue);
router.delete('/:id', authenticate, authorize('about-values', 'delete'), deleteAboutValue);
export default router;
