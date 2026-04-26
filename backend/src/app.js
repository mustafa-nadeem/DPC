import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './modules/auth/routes.js';
import publicRoutes from './modules/public/routes.js';
import requestRoutes from './modules/requests/routes.js';
import availabilityRoutes from './modules/availability/routes.js';
import paymentRoutes from './modules/payments/routes.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use((req, res, next) => {
    if (req.path === '/api/stripe/webhook') {
      express.raw({ type: 'application/json' })(req, res, next);
      return;
    }
    express.json()(req, res, next);
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
  });

  const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/public', publicLimiter, publicRoutes);
  app.use('/api/admin/requests', requireAuth, requestRoutes);
  app.use('/api/admin/availability', requireAuth, availabilityRoutes);
  app.use('/api/admin/payments', requireAuth, paymentRoutes);
  app.use('/api/admin', requireAuth, paymentRoutes);
  app.use('/api/stripe', paymentRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, env: env.nodeEnv });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
