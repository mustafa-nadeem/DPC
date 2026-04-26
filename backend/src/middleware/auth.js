import { prisma } from '../db.js';
import { HttpError } from '../lib/httpError.js';
import { supabaseServerClient } from '../lib/supabase.js';

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new HttpError(401, 'Authentication required');
    const { data, error } = await supabaseServerClient.auth.getUser(token);
    if (error || !data?.user) throw new HttpError(401, 'Invalid authentication token');

    const supabaseUser = data.user;
    const email = (supabaseUser.email || '').toLowerCase();
    if (!email) throw new HttpError(401, 'Supabase user email missing');

    let user =
      (await prisma.user.findFirst({
        where: {
          OR: [{ supabaseUserId: supabaseUser.id }, { email }],
        },
      })) || null;

    if (!user || !user.isActive) throw new HttpError(403, 'User is not authorized for this portal');

    if (!user.supabaseUserId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUserId: supabaseUser.id },
      });
    }

    req.authToken = token;
    req.supabaseUser = supabaseUser;
    req.user = user;
    req.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          entityType: 'authz',
          entityId: req.user.id,
          action: 'access_denied',
          metadata: {
            role: req.user.role,
            allowedRoles,
            method: req.method,
            path: req.originalUrl,
          },
        },
      }).catch(() => {});
      next(new HttpError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireAdminAuth(req, res, next) {
  return requireAuth(req, res, next);
}

export async function optionalAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      next();
      return;
    }
    await requireAuth(req, res, next);
  } catch (error) {
    next(error);
  }
}
