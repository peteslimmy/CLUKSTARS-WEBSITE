import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  setup2FA,
  verify2FA,
  verify2FALogin,
} from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/refresh', refreshToken as any);
router.post('/logout', logout as any);
router.get('/me', authenticate as any, getMe as any);
router.post('/2fa/setup', authenticate as any, setup2FA as any);
router.post('/2fa/verify', authenticate as any, verify2FA as any);
router.post('/2fa/login', verify2FALogin as any);

export default router;
