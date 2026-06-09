import { Router } from 'express';
import { getOrganization, updateOrganization } from '../controllers/organization';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getOrganization as any);
router.put('/', authenticate as any, updateOrganization as any);

export default router;
