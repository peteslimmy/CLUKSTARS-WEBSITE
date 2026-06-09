import { Router } from 'express';
import { getOrganization } from '../controllers/organization';
import { getBrandSettings } from '../controllers/brand';
import { listSocialLinks } from '../controllers/social';

const router = Router();

router.get('/organization', getOrganization as any);
router.get('/brand', getBrandSettings as any);
router.get('/social-links', listSocialLinks as any);

export default router;
