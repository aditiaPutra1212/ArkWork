import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Import nama cookie agar konsisten dengan middleware lain
import { ADMIN_COOKIE } from "../middleware/role";

const router = Router();

/* ===== 1. SECURITY CONFIGURATION ===== */
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

// Gunakan secret yang sama atau khusus admin, tapi WAJIB ada
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;

if (!JWT_ADMIN_SECRET) {
  throw new Error("[FATAL] JWT_ADMIN_SECRET (or JWT_SECRET) is required in .env");
}

const COOKIE_SAMESITE = IS_PROD ? 'none' : 'lax';
const COOKIE_SECURE = IS_PROD; // Wajib true di production (HTTPS)

/* ===== 2. HELPERS ===== */
function signAdminToken(payload: { uid: string; role?: string }) {
  return jwt.sign(
    { uid: payload.uid, role: payload.role ?? "admin" },
    JWT_ADMIN_SECRET!,
    { expiresIn: "7d", issuer: "arkwork-admin", audience: "arkwork-admins" }
  );
}

function setAdminCookie(res: Response, token: string) {
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Hari
  });
}

function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE
  });
}

/* ===== 3. VALIDATORS ===== */
const adminSigninSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username/Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

/* ===== 4. ROUTES ===== */

/* POST /api/admin/signin */
// Catatan: Rate Limit sudah ditangani oleh adminLimiter di index.ts
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const parsed = adminSigninSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const { usernameOrEmail, password } = parsed.data;
    const input = usernameOrEmail.trim().toLowerCase();

    // Logika Normalisasi Username (Email -> Username mapping jika perlu)
    let usernameToFind = input.includes("@") ? input.split("@")[0] : input;
    
    // Support hardcoded admin email mapping via ENV (Optional feature)
    const emailsEnv = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (input.includes("@") && emailsEnv.includes(input) && process.env.ADMIN_USERNAME) {
      usernameToFind = process.env.ADMIN_USERNAME;
    }

    // Cari Admin di Database
    const admin = await prisma.admin.findUnique({ where: { username: usernameToFind } });
    
    // Generic Error Message (Security Practice: Jangan kasih tau user tidak ditemukan)
    const failureMsg = "Kredensial tidak valid";

    if (!admin) return res.status(401).json({ message: failureMsg });

    // Cek Password
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: failureMsg });

    // Login Sukses
    const token = signAdminToken({ uid: admin.id, role: "admin" });
    setAdminCookie(res, token);

    console.info(`[ADMIN][SIGNIN] Success: ${admin.username} (IP: ${req.ip})`);
    return res.json({ ok: true, admin: { id: admin.id, username: admin.username } });

  } catch (err: any) {
    console.error("[ADMIN][SIGNIN][ERROR]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* GET /api/admin/me */
router.get("/me", async (req: Request, res: Response) => {
  try {
    // Ambil cookie
    const token = (req as any).cookies?.[ADMIN_COOKIE];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Verifikasi Token
      const payload = jwt.verify(token, JWT_ADMIN_SECRET!) as any;
      
      if (!payload || payload.role !== "admin" || !payload.uid) {
        clearAdminCookie(res);
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Pastikan Admin masih ada di DB
      const admin = await prisma.admin.findUnique({ 
        where: { id: payload.uid }, 
        select: { id: true, username: true } 
      });

      if (!admin) {
        clearAdminCookie(res);
        return res.status(401).json({ message: "Unauthorized" });
      }

      return res.json({ id: admin.id, username: admin.username, role: "admin" });

    } catch (e: any) {
      clearAdminCookie(res);
      return res.status(401).json({ message: "Sesi kedaluwarsa atau tidak valid" });
    }
  } catch (e: any) {
    console.error("[ADMIN][ME] error", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* POST /api/admin/signout */
router.post("/signout", (_req: Request, res: Response) => {
  try {
    clearAdminCookie(res);
    return res.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN][SIGNOUT] error", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;