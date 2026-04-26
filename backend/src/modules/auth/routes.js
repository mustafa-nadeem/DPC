import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { logAudit } from '../../services/auditService.js';

const router = Router();

const loginSchema = z.object({
  accessToken: z.string().min(20),
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    req.headers.authorization = `Bearer ${input.accessToken}`;
    requireAuth(req, res, async (err) => {
      if (err) {
        next(err);
        return;
      }
      await logAudit({
        actorId: req.user.id,
        entityType: 'auth',
        entityId: req.user.id,
        action: 'login_success_supabase',
        metadata: { email: req.user.email, role: req.user.role },
      });
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
        },
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    },
  });
});

export default router;
