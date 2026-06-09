import { Router } from 'express';
import { getOrganization, updateOrganization } from '../controllers/organization';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getOrganization);
router.put('/', authenticate, updateOrganization);

export default router;
