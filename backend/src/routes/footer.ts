import { Router } from 'express';
import { getFooterSettings, updateFooterSettings } from '../controllers/footer';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getFooterSettings);
router.put('/', authenticate, updateFooterSettings);

export default router;
