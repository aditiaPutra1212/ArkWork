// backend/src/middleware/role.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || JWT_SECRET;

export const ADMIN_COOKIE = process.env.ADMIN_COOKIE_NAME || 'admin_token';
export const EMP_COOKIE = process.env.EMP_COOKIE_NAME || 'emp_token';
export const USER_COOKIE = process.env.USER_COOKIE_NAME || 'user_token';

export type Role = 'admin' | 'employer' | 'user';

// Interface untuk memperluas Request Express
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      role: string;
    }
    interface Request {
      auth?: { userId: string; role: string; eid?: string | null };
    }
  }
}

/**
 * Helper: Ambil token dari Cookie
 */
function getCookieToken(req: Request, name: string): string | undefined {
  // 1. Cek req.cookies (dari cookie-parser)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rc = (req as any).cookies;
  if (rc && typeof rc === 'object' && rc[name]) {
    return rc[name] as string;
  }
  
  // 2. Fallback: Parse manual header 'Cookie'
  const raw = req.headers.cookie || '';
  try {
    const parts = raw.split(';');
    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === name && val) return decodeURIComponent(val);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Middleware Utama: Auth Required (Hybrid: Passport Session + JWT)
 * Digunakan untuk User / Candidate
 */
export function authRequired(req: Request, res: Response, next: NextFunction) {
  // A. STRATEGI 1: Cek Login Google (Passport Session)
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    
    // Standarisasi req.auth (untuk controller baru)
    req.auth = { 
      userId: user.id, 
      role: user.role || 'user',
      eid: null 
    };
    return next();
  }

  // B. STRATEGI 2: Cek Login Manual (JWT Cookie)
  const token = getCookieToken(req, USER_COOKIE);

  if (!token) {
    // Tidak ada session Google & Tidak ada Token Cookie
    return res.status(401).json({ message: 'Unauthorized: Silakan login.' });
  }

  try {
    // Verifikasi Token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // PENTING: Hydrate req.user agar Controller yang pakai style Passport tetap jalan
    (req as any).user = {
      id: decoded.uid,      // Mapping: uid (JWT) -> id (App)
      email: decoded.email,
      role: decoded.role || 'user'
    };

    // Standarisasi req.auth
    req.auth = {
      userId: decoded.uid,
      role: (decoded.role as string) || 'user',
      eid: null
    };

    return next();

  } catch (err) {
    console.error('[AUTH] Token Invalid:', err);
    return res.status(401).json({ message: 'Session expired, please login again.' });
  }
}

/**
 * Middleware Khusus Employer
 */
export function employerRequired(req: Request, res: Response, next: NextFunction) {
  const token = getCookieToken(req, EMP_COOKIE);
  
  if (!token) return res.status(401).json({ message: 'No employer token found' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Cek Role
    if (decoded.role !== 'employer' && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Employers only' });
    }

    req.auth = { 
        userId: decoded.uid, 
        role: decoded.role, 
        eid: decoded.eid || null 
    };
    
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid employer session' });
  }
}

/**
 * Middleware Khusus Admin
 */
export function adminRequired(req: Request, res: Response, next: NextFunction) {
  const token = getCookieToken(req, ADMIN_COOKIE);

  if (!token) return res.status(401).json({ message: 'No admin token found' });

  try {
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET) as JwtPayload; // Note: Pakai Secret Admin

    // Cek Role (ekstra proteksi)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    req.auth = { userId: decoded.uid, role: 'admin' };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid admin session' });
  }
}

// --- Legacy helpers (tetap disimpan jika ada file lain yang import ini) ---
export function readUserAuth(req: Request) {
    // Fungsi ini dipanggil manual jika butuh data tanpa lewat middleware route
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

export function readAdminAuth(req: Request) {
    const token = getCookieToken(req, ADMIN_COOKIE);
    if (!token) throw new Error('No token');
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET) as any;
    return { uid: decoded.uid, role: 'admin' };
}