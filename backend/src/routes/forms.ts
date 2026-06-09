import { Router } from 'express';
import { createFormSubmission, listFormSubmissions, getFormSubmission, updateFormSubmission, deleteFormSubmission } from '../controllers/forms';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', createFormSubmission);
router.get('/', authenticate, authorize('forms', 'list'), listFormSubmissions);
router.get('/:id', authenticate, authorize('forms', 'read'), getFormSubmission);
router.put('/:id', authenticate, authorize('forms', 'update'), updateFormSubmission);
router.delete('/:id', authenticate, authorize('forms', 'delete'), deleteFormSubmission);

export default router;
