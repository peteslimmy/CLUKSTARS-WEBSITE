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

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/2fa/login', verify2FALogin);

export default router;
