import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '../lib/mailer';
import { ADMIN_COOKIE, EMP_COOKIE, USER_COOKIE } from '../middleware/role';
import * as authController from '../controllers/auth.controller';

const router = Router();

/* ===== 1. SECURITY CONFIGURATION ===== */
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// VALIDASI SECURITY: Jangan gunakan fallback string!
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || JWT_SECRET; // Admin boleh pakai secret sama jika tidak di-set, tapi sebaiknya beda.

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in .env (auth.ts)');
}

// Konfigurasi Cookie yang SAMA KETATNYA dengan index.ts
const COOKIE_SAMESITE = IS_PROD ? 'none' : 'lax';
const COOKIE_SECURE = IS_PROD; // Wajib true di production (HTTPS)

/* ===== JWT options ===== */
const JWT_USER_ISSUER = process.env.JWT_USER_ISSUER || 'arkwork';
const JWT_USER_AUDIENCE = process.env.JWT_USER_AUDIENCE || 'arkwork-users';
const JWT_ADMIN_ISSUER = process.env.JWT_ADMIN_ISSUER || 'arkwork-admin';
const JWT_ADMIN_AUDIENCE = process.env.JWT_ADMIN_AUDIENCE || 'arkwork-admins';

/* ===== helpers ===== */
type JWTPayload = { uid: string; role: 'user' | 'admin' | 'employer'; iat?: number; exp?: number; aud?: string; iss?: string };

export function signUserToken(payload: { uid: string; role?: string }) {
  // TypeScript sudah tahu JWT_SECRET ada karena pengecekan di atas
  return jwt.sign({ uid: payload.uid, role: payload.role ?? 'user' }, JWT_SECRET!, {
    expiresIn: '30d',
    issuer: JWT_USER_ISSUER,
    audience: JWT_USER_AUDIENCE,
  });
}

export function signAdminToken(payload: { uid: string; role?: string }) {
  const secret = JWT_ADMIN_SECRET || JWT_SECRET!;
  return jwt.sign({ uid: payload.uid, role: payload.role ?? 'admin' }, secret, {
    expiresIn: '7d',
    issuer: JWT_ADMIN_ISSUER,
    audience: JWT_ADMIN_AUDIENCE,
  });
}

export function verifyUserToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET!, { issuer: JWT_USER_ISSUER, audience: JWT_USER_AUDIENCE }) as JWTPayload;
}

export function verifyAdminToken(token: string): JWTPayload {
  const secret = JWT_ADMIN_SECRET || JWT_SECRET!;
  return jwt.verify(token, secret, { issuer: JWT_ADMIN_ISSUER, audience: JWT_ADMIN_AUDIENCE }) as JWTPayload;
}

export function setCookie(res: Response, name: string, token: string, maxAgeSec = 7 * 24 * 60 * 60) {
  const opts: any = {
    httpOnly: true,
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE, // Strict security
    path: '/',
    maxAge: maxAgeSec * 1000,
  };
  res.cookie(name, token, opts);
}

export function clearCookie(res: Response, name: string) {
  const opts: any = {
    httpOnly: true,
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE,
    path: '/',
    maxAge: 0,
  };
  res.clearCookie(name, opts);
}

/* ===== validators ===== */
const userSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const userSigninSchema = z.object({
  usernameOrEmail: z.string().min(3, "Email/Username is required"),
  password: z.string().min(1, "Password is required"),
});

const adminSigninSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

const verifyTokenSchema = z.object({
  token: z.string().length(64, "Invalid token format").regex(/^[a-f0-9]+$/i, "Invalid token characters"),
});

/* ===== routes ===== */

router.get('/', (_req, res) => res.json({ message: 'Auth route works!' }));

router.post('/forgot', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/verify-token/:token', authController.verifyToken);

/* ----- USER SIGNUP (Sends Verification Email) ----- */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = userSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Data tidak valid. Periksa nama, email, dan password (min 8 char)." });
    }
    const { name, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();
    
    const exists = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (exists) {
      if (!exists.isVerified && exists.verificationTokenExpiresAt && exists.verificationTokenExpiresAt > new Date()) {
        return res.status(409).json({ message: 'Email sudah terdaftar namun belum diverifikasi. Cek inbox Anda.' });
      }
      return res.status(409).json({ message: 'Email ini sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: lowerEmail, passwordHash, isVerified: false },
      select: { id: true, email: true, name: true },
    });

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationTokenExpiresAt: expires },
    });

    const verificationUrl = `${FRONTEND_URL}/auth/verify?token=${token}`;
    
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (emailError: any) {
      console.error(`[AUTH][SIGNUP] Email failed for ${user.email}:`, emailError?.message);
      // Rollback user creation if email fails
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      return res.status(500).json({ message: 'Gagal mengirim email verifikasi. Silakan coba lagi.' });
    }

    return res.status(201).json({
      ok: true,
      message: 'Akun dibuat! Silakan cek email Anda untuk verifikasi.'
    });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'Email sudah terdaftar.' });
    next(e);
  }
});

/* ----- USER SIGNIN ----- */
router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = userSigninSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Email dan Password wajib diisi." });

    const { usernameOrEmail, password } = parsed.data;
    const input = usernameOrEmail.trim();
    
    const userCredentials = input.includes('@')
      ? await prisma.user.findUnique({ where: { email: input.toLowerCase() }, select: { id: true, passwordHash: true, isVerified: true, email: true } })
      : await prisma.user.findFirst({ where: { name: input }, select: { id: true, passwordHash: true, isVerified: true, email: true } });
    
    if (!userCredentials || !userCredentials.passwordHash) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const passwordMatch = await bcrypt.compare(password, userCredentials.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    if (!userCredentials.isVerified) {
      return res.status(403).json({ message: 'Email belum diverifikasi. Silakan cek inbox Anda.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userCredentials.id },
      select: { id: true, email: true, name: true, photoUrl: true, cvUrl: true, createdAt: true }
    });

    if (!user) return res.status(500).json({ message: 'Internal Server Error.' });

    // Login Sukses
    const token = signUserToken({ uid: user.id, role: 'user' });
    setCookie(res, USER_COOKIE, token, 30 * 24 * 60 * 60);
    
    return res.json({ ok: true, user: { ...user, role: 'user' } });
  } catch (e: any) {
    next(e);
  }
});

/* ----- USER SIGNOUT ----- */
router.post('/signout', (_req: Request, res: Response) => {
  clearCookie(res, USER_COOKIE);
  clearCookie(res, EMP_COOKIE);
  clearCookie(res, ADMIN_COOKIE);
  return res.status(204).end();
});

/* ----- ME (Get Current User) ----- */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  const cookies = parse(req.headers.cookie || '');
  const userToken = cookies[USER_COOKIE];
  const adminToken = cookies[ADMIN_COOKIE];

  // 1. Cek Admin
  if (adminToken) {
    try {
      const payload = verifyAdminToken(adminToken);
      if (payload && payload.uid) {
        const a = await prisma.admin.findUnique({ where: { id: payload.uid }, select: { id: true, username: true, createdAt: true } });
        if (a) return res.json({ ok: true, data: { ...a, role: 'admin' } });
      }
    } catch (e) { /* Ignore invalid token, try next */ }
  }

  // 2. Cek User
  if (userToken) {
    try {
      const payload = verifyUserToken(userToken);
      if (payload && payload.uid) {
        const u = await prisma.user.findUnique({
          where: { id: payload.uid },
          select: { id: true, email: true, name: true, photoUrl: true, cvUrl: true, createdAt: true, isVerified: true }
        });
        
        if (u) {
           if (!u.isVerified) {
             clearCookie(res, USER_COOKIE);
             return res.status(403).json({ message: 'Sesi kedaluwarsa atau akun belum verifikasi.' });
           }
           const { isVerified, ...data } = u;
           return res.json({ ok: true, data: { ...data, role: 'user' } });
        }
      }
    } catch (e) {
      // Jika token expired/invalid
      clearCookie(res, USER_COOKIE);
    }
  }

  return res.status(401).json({ message: 'Tidak ada sesi aktif.' });
});

/* ----- VERIFY EMAIL ----- */
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyTokenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Link verifikasi tidak valid." });

    const { token } = parsed.data;
    
    const user = await prisma.user.findFirst({
      where: { verificationToken: token, verificationTokenExpiresAt: { gt: new Date() }, isVerified: false },
    });

    if (!user) {
      return res.status(400).json({ message: "Link verifikasi kedaluwarsa atau tidak valid." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null, verificationTokenExpiresAt: null },
      select: { id: true, email: true, name: true, photoUrl: true, cvUrl: true, createdAt: true },
    });

    // Auto login setelah verifikasi
    const loginToken = signUserToken({ uid: updatedUser.id, role: 'user' });
    setCookie(res, USER_COOKIE, loginToken, 30 * 24 * 60 * 60);

    return res.json({ ok: true, message: 'Email berhasil diverifikasi!', user: { ...updatedUser, role: 'user' } });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ message: "Request duplikat." });
    return res.status(500).json({ message: 'Gagal memverifikasi email.' });
  }
});

/* ----- ADMIN SIGNIN ----- */
router.post('/admin/signin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = adminSigninSchema.safeParse(req.body); 
    if (!parsed.success) return res.status(400).json({ message: "Username & Password required." }); 
    
    const { username, password } = parsed.data; 
    const admin = await prisma.admin.findUnique({ where: { username } }); 
    
    if (!admin || !admin.passwordHash) return res.status(401).json({ message: 'Kredensial salah.' });
    
    const ok = await bcrypt.compare(password, admin.passwordHash); 
    if (!ok) return res.status(401).json({ message: 'Kredensial salah.' });
    
    const token = signAdminToken({ uid: admin.id, role: 'admin' }); 
    setCookie(res, ADMIN_COOKIE, token, 7 * 24 * 60 * 60);
    
    return res.json({ ok: true, data: { id: admin.id, username: admin.username, role: 'admin' } });
  } catch (e: any) { next(e); }
});

/* ----- ADMIN SIGNOUT ----- */
router.post('/admin/signout', (_req: Request, res: Response) => {
  clearCookie(res, ADMIN_COOKIE);
  clearCookie(res, USER_COOKIE);
  clearCookie(res, EMP_COOKIE);
  return res.status(204).end();
});

export default router;