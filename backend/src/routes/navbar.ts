import { Router } from 'express';
import { getNavbarSettings, updateNavbarSettings } from '../controllers/navbar';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getNavbarSettings);
router.put('/', authenticate, updateNavbarSettings);

export default router;
