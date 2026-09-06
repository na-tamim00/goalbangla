import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback_secret_goalbangla_sports_desk_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Role Permissions Map
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Admin': ['*'],
  'Admin': [
    'article:create', 'article:edit', 'article:publish', 'article:delete',
    'breaking:manage', 'media:create', 'media:delete', 'gallery:manage',
    'video:manage', 'match:update', 'standings:update', 'transfer:manage',
    'injury:manage', 'translation:create', 'translation:publish', 'settings:manage'
  ],
  'Editor': [
    'article:create', 'article:edit', 'article:publish', 'article:delete',
    'breaking:manage', 'media:create', 'translation:create', 'translation:publish',
    'match:update', 'transfer:manage', 'injury:manage'
  ],
  'Writer': [
    'article:create', 'article:edit', 'media:create'
  ],
  'Translator': [
    'translation:create', 'translation:publish'
  ],
  'Media Manager': [
    'media:create', 'media:delete', 'gallery:manage', 'video:manage'
  ],
  'Data Operator': [
    'match:update', 'standings:update', 'transfer:manage', 'injury:manage'
  ]
};

export function hasPermission(role: string, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Extract current user from Authorization header OR fallback demo header
export async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Support demo / dev role switching in development environment only
  if (process.env.NODE_ENV !== 'production') {
    const headerUserId = req.headers['x-user-id'] as string;
    const headerRole = req.headers['x-user-role'] as string;
    const headerName = req.headers['x-user-name'] as string;

    if (headerUserId && headerRole) {
      req.user = {
        id: headerUserId,
        role: headerRole,
        name: headerName || 'Editorial Staff',
        email: `${headerUserId}@goalbangla.com`
      };
    }
  }

  next();
}

// Server-side RBAC Guard Middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to perform this action.',
      code: 'UNAUTHENTICATED'
    });
  }
  next();
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: `Permission denied: Role "${req.user.role}" does not have permission "${permission}".`,
        code: 'FORBIDDEN',
        requiredPermission: permission,
        userRole: req.user.role
      });
    }

    next();
  };
}
