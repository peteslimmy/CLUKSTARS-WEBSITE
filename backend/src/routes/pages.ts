import { Router } from 'express';
import { listPages, getPage, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/pages';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('pages', 'list'), listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', authenticate, authorize('pages', 'read'), getPage);
router.post('/', authenticate, authorize('pages', 'create'), createPage);
router.put('/:id', authenticate, authorize('pages', 'update'), updatePage);
router.delete('/:id', authenticate, authorize('pages', 'delete'), deletePage);

export default router;
