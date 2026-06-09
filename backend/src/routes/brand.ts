import { Router } from 'express';
import { getBrandSettings, updateBrandSettings } from '../controllers/brand';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getBrandSettings as any);
router.put('/', authenticate as any, updateBrandSettings as any);

export default router;
