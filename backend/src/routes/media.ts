import { Router } from 'express';
import {
  uploadMedia,
  listMedia,
  getMedia,
  updateMedia,
  deleteMedia,
  uploadBrandImage,
} from '../controllers/media';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', listMedia as any);
router.post('/', authenticate as any, authorize('media', 'create') as any, upload.single('file'), uploadMedia as any);
router.post('/upload-brand', authenticate as any, upload.single('file'), uploadBrandImage as any);
router.get('/:id', getMedia as any);
router.put('/:id', authenticate as any, authorize('media', 'update') as any, updateMedia as any);
router.delete('/:id', authenticate as any, authorize('media', 'delete') as any, deleteMedia as any);

export default router;
