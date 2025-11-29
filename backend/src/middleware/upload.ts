import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

/* --- 1. KONFIGURASI PENYIMPANAN (STORAGE) --- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // File akan disimpan di folder public/uploads
    // Pastikan folder ini ada, atau buat manual: mkdir public/uploads
    cb(null, path.join(process.cwd(), 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // SECURITY: Ganti nama file asli dengan string acak
    // Agar hacker tidak bisa menimpa file sistem atau menebak nama file user lain
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/* --- 2. FILTER: HANYA DOKUMEN (PDF/DOC) --- */
const documentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx/;
  // Cek ekstensi (.pdf) DAN mime type (application/pdf)
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file dokumen (PDF, DOC, DOCX) yang diperbolehkan!'));
  }
};

/* --- 3. FILTER: HANYA GAMBAR (JPG/PNG) --- */
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!'));
  }
};

/* --- 4. EXPORT CONFIG (SIAP PAKAI) --- */

// Opsi A: Untuk Upload CV (Max 5MB)
export const uploadCV = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Opsi B: Untuk Upload Gambar/Logo (Max 2MB)
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});