import { Router } from 'express';
import { listCaseStudies, getCaseStudy, getCaseStudyBySlug, createCaseStudy, updateCaseStudy, deleteCaseStudy } from '../controllers/case-studies';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('case-studies', 'list'), listCaseStudies);
router.get('/slug/:slug', getCaseStudyBySlug);
router.get('/:id', authenticate, authorize('case-studies', 'read'), getCaseStudy);
router.post('/', authenticate, authorize('case-studies', 'create'), createCaseStudy);
router.put('/:id', authenticate, authorize('case-studies', 'update'), updateCaseStudy);
router.delete('/:id', authenticate, authorize('case-studies', 'delete'), deleteCaseStudy);

export default router;
