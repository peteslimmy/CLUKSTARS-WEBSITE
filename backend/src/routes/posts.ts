import { Router } from 'express';
import { listPosts, getPost, getPostBySlug, createPost, updatePost, deletePost } from '../controllers/posts';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('posts', 'list'), listPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', authenticate, authorize('posts', 'read'), getPost);
router.post('/', authenticate, authorize('posts', 'create'), createPost);
router.put('/:id', authenticate, authorize('posts', 'update'), updatePost);
router.delete('/:id', authenticate, authorize('posts', 'delete'), deletePost);

export default router;
