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

router.get('/', listMedia);
router.post('/', authenticate, authorize('media', 'create'), upload.single('file'), uploadMedia);
router.post('/upload-brand', authenticate, upload.single('file'), uploadBrandImage);
router.get('/:id', getMedia);
router.put('/:id', authenticate, authorize('media', 'update'), updateMedia);
router.delete('/:id', authenticate, authorize('media', 'delete'), deleteMedia);

export default router;
