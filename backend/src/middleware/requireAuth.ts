// backend/src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma'; // Pastikan path import prisma sudah benar

// Konfigurasi Cookie & Secret
const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || 'user_token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/* CATATAN: 
   Kita TIDAK butuh interface 'RequestWithUser' lagi.
   Karena di file 'role.ts' kita sudah declare global Express.User & Express.Request
   TypeScript otomatis tahu struktur req.user dan req.auth.
*/

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  
  // ---------------------------------------------------------
  // 1. CEK LOGIN GOOGLE (PASSPORT SESSION)
  // ---------------------------------------------------------
  if (req.isAuthenticated && req.isAuthenticated()) {
    // req.user sudah diisi oleh Passport, tapi kita casting ke any untuk mapping aman
    const passportUser = req.user as any;
    
    // Standarisasi req.auth (Untuk Controller yang butuh userId/role)
    req.auth = { 
        userId: passportUser.id, 
        role: passportUser.role || 'user',
        eid: null
    };

    console.log(`[requireAuth] Success: User ${passportUser.id} authenticated via Google.`);
    return next();
  }

  // ---------------------------------------------------------
  // 2. CEK LOGIN MANUAL (JWT COOKIE)
  // ---------------------------------------------------------
  const token = req.cookies?.[USER_COOKIE_NAME] || req.cookies?.['token'] || req.cookies?.['ark_user_token'];

  if (!token) {
    // Return 401 tanpa logging berlebihan (hemat log untuk visitor biasa)
    return res.status(401).json({ ok: false, message: 'Not authenticated: Missing token.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    // Support berbagai format payload (uid dari controller auth baru, sub standar JWT)
    const userId = payload.uid || payload.sub || payload.id;

    if (!userId || typeof userId !== 'string') {
        console.log('[requireAuth] Failed: Invalid payload - missing user ID.', payload);
        throw new Error('Invalid token payload');
    }

    // Fetch user dari DB untuk memastikan user valid
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, photoUrl: true } 
    });

    if (!user) {
        console.log(`[requireAuth] Failed: User ${userId} not found in database.`);
        res.clearCookie(USER_COOKIE_NAME);
        return res.status(401).json({ ok: false, message: 'User not found.' });
    }

    // ------------------------------------------------------
    // FIX UTAMA DISINI:
    // Kita harus memasukkan 'role' agar sesuai dengan definisi tipe global
    // Karena tabel User tidak punya kolom role, kita hardcode 'user'
    // ------------------------------------------------------
    req.user = {
      id: user.id,
      email: user.email,
      role: 'user' 
    };

    // Isi req.auth untuk kemudahan di controller
    req.auth = { 
        userId: user.id, 
        role: 'user', 
        eid: null 
    };

    // (Opsional) Jika ada controller lama yang pakai req.userId
    (req as any).userId = user.id;

    return next(); 

  } catch (err: any) {
    // Error handling token
    if (err.name === 'TokenExpiredError') {
         res.clearCookie(USER_COOKIE_NAME);
         return res.status(401).json({ ok: false, message: 'Session expired, please log in again.' });
    }
    
    console.log('[requireAuth] Token error:', err.message);
    return res.status(401).json({ ok: false, message: 'Invalid token.' });
  }
}