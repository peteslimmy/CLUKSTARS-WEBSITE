import { Router } from 'express';
import {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
  listServices, getService, createService, updateService, deleteService,
} from '../controllers/services';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/categories', authenticate, authorize('services', 'list'), listCategories);
router.get('/categories/:id', authenticate, authorize('services', 'read'), getCategory);
router.post('/categories', authenticate, authorize('services', 'create'), createCategory);
router.put('/categories/:id', authenticate, authorize('services', 'update'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('services', 'delete'), deleteCategory);

router.get('/', authenticate, authorize('services', 'list'), listServices);
router.get('/:id', authenticate, authorize('services', 'read'), getService);
router.post('/', authenticate, authorize('services', 'create'), createService);
router.put('/:id', authenticate, authorize('services', 'update'), updateService);
router.delete('/:id', authenticate, authorize('services', 'delete'), deleteService);

export default router;
