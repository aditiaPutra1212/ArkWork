import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authRequired } from '../middleware/role';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { prisma } from '../lib/prisma';

const router = Router();

// --- 1. KONFIGURASI MULTER (UPLOAD) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/avatars';
    // Cek apakah folder ada, jika tidak buat folder secara otomatis (Recursive)
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate nama file unik: avatar-{timestamp}-{random}.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
});

// --- HELPER: AMBIL USER ID DARI SESSION ---
// Ini penting agar tidak error "undefined" baik saat login via Google maupun Email biasa
function getUserId(req: any): string | null {
    if (req.user && req.user.id) return req.user.id;      // Dari Passport.js
    if (req.auth && req.auth.userId) return req.auth.userId; // Dari Custom Middleware
    return null;
}

// --- 2. DEFINISI ROUTES ---

// GET: Ambil data profile
router.get('/', authRequired, getProfile);

// PUT: Update data profile (Text)
router.put('/', authRequired, updateProfile);

// POST: Upload Avatar
router.post('/avatar', authRequired, upload.single('avatar'), async (req, res) => {
    try {
        // 1. Cek apakah file terupload
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
        }
        
        // 2. Ambil User ID dengan aman
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID tidak ditemukan.' });
        }

        // 3. Simpan Path File
        const fileUrl = `/uploads/avatars/${req.file.filename}`;

        // 4. Update Database
        await prisma.user.update({
            where: { id: userId },
            data: {
                photoUrl: fileUrl 
            }
        });

        // 5. Berhasil
        res.json({ ok: true, url: fileUrl });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: 'Gagal mengunggah avatar.' });
    }
    
});

export default router;