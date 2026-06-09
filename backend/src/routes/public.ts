import { Router } from 'express';
import { getOrganization } from '../controllers/organization';
import { getBrandSettings } from '../controllers/brand';
import { listSocialLinks } from '../controllers/social';

const router = Router();

router.get('/organization', getOrganization);
router.get('/brand', getBrandSettings);
router.get('/social-links', listSocialLinks);

export default router;
