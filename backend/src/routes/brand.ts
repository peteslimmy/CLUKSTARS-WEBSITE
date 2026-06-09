import { Router } from 'express';
import { getBrandSettings, updateBrandSettings } from '../controllers/brand';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getBrandSettings);
router.put('/', authenticate, updateBrandSettings);

export default router;
