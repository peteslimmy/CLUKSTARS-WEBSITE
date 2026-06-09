import { Router } from 'express';
import { listGlobalBlocks, getGlobalBlock, createGlobalBlock, updateGlobalBlock, deleteGlobalBlock } from '../controllers/global-blocks';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('global-blocks', 'list'), listGlobalBlocks);
router.get('/:id', authenticate, authorize('global-blocks', 'read'), getGlobalBlock);
router.post('/', authenticate, authorize('global-blocks', 'create'), createGlobalBlock);
router.put('/:id', authenticate, authorize('global-blocks', 'update'), updateGlobalBlock);
router.delete('/:id', authenticate, authorize('global-blocks', 'delete'), deleteGlobalBlock);
export default router;
