import { Router } from 'express';
import {
  listBlocks,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from '../controllers/blocks';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:sectionId', authenticate, authorize('pages', 'read'), listBlocks);
router.get('/detail/:id', authenticate, authorize('pages', 'read'), getBlock);
router.post('/', authenticate, authorize('pages', 'create'), createBlock);
router.put('/:id', authenticate, authorize('pages', 'update'), updateBlock);
router.delete('/:id', authenticate, authorize('pages', 'delete'), deleteBlock);
router.post('/reorder', authenticate, authorize('pages', 'update'), reorderBlocks);

export default router;