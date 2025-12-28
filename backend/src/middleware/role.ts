// backend/src/middleware/role.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || JWT_SECRET;

export const ADMIN_COOKIE = process.env.ADMIN_COOKIE_NAME || 'admin_token';
export const EMP_COOKIE = process.env.EMP_COOKIE_NAME || 'emp_token';
export const USER_COOKIE = process.env.USER_COOKIE_NAME || 'user_token';

// Interface untuk memperluas Request Express
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      role: string;
      employerId?: string; // Tambahkan employerId jika ada
    }
    interface Request {
      auth?: { userId: string; role: string; eid?: string | null };
    }
  }
}

/**
 * Helper: Ambil token dari Cookie (Robust)
 */
function getCookieToken(req: Request, name: string): string | undefined {
  const rc = (req as any).cookies;
  if (rc && typeof rc === 'object' && rc[name]) return rc[name] as string;

  const raw = req.headers.cookie || '';
  try {
    const parts = raw.split(';');
    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === name && val) return decodeURIComponent(val);
    }
  } catch { return undefined; }
  return undefined;
}

/**
 * Middleware: Auth Required (Hybrid)
 * Untuk User / Candidate
 */
export function authRequired(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    req.auth = { userId: user.id, role: user.role || 'user', eid: null };
    return next();
  }

  const token = getCookieToken(req, USER_COOKIE);
  if (!token) return res.status(401).json({ message: 'Unauthorized: Silakan login.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = { id: decoded.uid, email: decoded.email, role: decoded.role || 'user' };
    req.auth = { userId: decoded.uid, role: (decoded.role as string) || 'user', eid: null };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired' });
  }
}

/**
 * Middleware Khusus Employer (FIXED: Hybrid Session + JWT)
 */
export function employerRequired(req: Request, res: Response, next: NextFunction) {
  // 1. STRATEGI 1: Cek Session Passport (Penting agar sinkron dengan /me)
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    const role = (user.role || '').toLowerCase();

    if (role === 'employer' || role === 'admin') {
      req.auth = { 
        userId: user.id, 
        role: user.role, 
        eid: user.employerId || user.id 
      };
      return next();
    }
  }

  // 2. STRATEGI 2: Cek JWT Cookie (emp_token)
  const token = getCookieToken(req, EMP_COOKIE);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const role = (decoded.role as string || '').toLowerCase();

      if (role === 'employer' || role === 'admin') {
        req.auth = { 
          userId: decoded.uid, 
          role: decoded.role as string, 
          eid: (decoded.eid as string) || null 
        };
        // Hydrate req.user untuk controller
        (req as any).user = { id: decoded.uid, role: decoded.role, employerId: decoded.eid };
        return next();
      }
    } catch (err) {
      console.error('[AUTH] Employer Token Invalid');
    }
  }

  return res.status(401).json({ message: 'Unauthorized: Employer access required' });
}

/**
 * Middleware Khusus Admin (Hybrid)
 */
export function adminRequired(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    if (user.role === 'admin') {
      req.auth = { userId: user.id, role: 'admin' };
      return next();
    }
  }

  const token = getCookieToken(req, ADMIN_COOKIE);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_ADMIN_SECRET) as JwtPayload;
      if (decoded.role === 'admin') {
        req.auth = { userId: decoded.uid, role: 'admin' };
        return next();
      }
    } catch (err) { /* ignore */ }
  }

  return res.status(403).json({ message: 'Admins only' });
}

// --- Legacy helpers ---
export function readUserAuth(req: Request) {
    const token = getCookieToken(req, USER_COOKIE);
    if (!token) throw new Error('No token');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { uid: decoded.uid, role: decoded.role, eid: null };
}

export function readEmployerAuth(req: Request) {
    const token = getCookieToken(req, EMP_COOKIE);
    if (!token) throw new Error('No token');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { uid: decoded.uid, role: decoded.role, eid: decoded.eid };
}