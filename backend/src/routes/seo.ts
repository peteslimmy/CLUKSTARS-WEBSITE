import { Router } from 'express';
import { getSeoSettings, updateSeoSettings } from '../controllers/seo';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getSeoSettings);
router.put('/', authenticate, updateSeoSettings);

export default router;
