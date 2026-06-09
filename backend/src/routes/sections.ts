import { Router } from 'express';
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from '../controllers/sections';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:pageId', authenticate, authorize('pages', 'read'), listSections);
router.get('/detail/:id', authenticate, authorize('pages', 'read'), getSection);
router.post('/', authenticate, authorize('pages', 'create'), createSection);
router.put('/:id', authenticate, authorize('pages', 'update'), updateSection);
router.delete('/:id', authenticate, authorize('pages', 'delete'), deleteSection);
router.post('/reorder', authenticate, authorize('pages', 'update'), reorderSections);

export default router;