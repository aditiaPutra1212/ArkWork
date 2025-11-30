import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import NodeClam from 'clamscan';

/* --- 1. KONFIGURASI PENYIMPANAN (STORAGE) --- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder public/uploads sudah ada
    cb(null, path.join(process.cwd(), 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // SECURITY: Random filename agar tidak bisa ditebak/ditimpa
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

/* --- 4. EXPORT CONFIG (MULTER) --- */
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

/* --- 5. MIDDLEWARE VIRUS SCAN (CLAMAV) --- */
// Middleware ini dipasang SETELAH upload.single(...)
export const scanFile = async (req: Request, res: Response, next: NextFunction) => {
  // Jika tidak ada file yang diupload, skip scan (lanjut ke controller)
  if (!req.file) return next();

  const filePath = req.file.path;

  try {
    // Inisialisasi ClamAV Client
    const clamscan = new NodeClam().init({
      removeInfected: true, // Otomatis hapus file jika virus
      debugMode: false,
      preference: 'clamdscan', // Menggunakan Daemon (lebih cepat)
      clamdscan: {
        host: '127.0.0.1', // IP localhost
        port: 3310,        // Port default ClamAV
        timeout: 60000,    // 60 detik timeout
      }
    });

    const av = await clamscan;
    const { isInfected, viruses } = await av.isInfected(filePath);

    if (isInfected) {
      // SECURITY ACTION: Hapus file & Tolak Request
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      console.warn(`[SECURITY] Virus detected in ${req.file.originalname}: ${viruses.join(', ')}`);
      
      return res.status(406).json({ 
        ok: false, 
        error: 'Security Alert: File Anda terdeteksi mengandung virus dan telah dihapus otomatis.' 
      });
    }

    // Jika file bersih, lanjut ke controller
    next();

  } catch (error: any) {
    // --- MODE DEVELOPMENT (FALLBACK) ---
    // Jika ClamAV belum diinstall di komputer (Windows), error 'ECONNREFUSED' akan muncul.
    // Kita biarkan lewat agar Anda tetap bisa coding tanpa install antivirus berat.
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Could not find clamdscan')) {
      console.warn('[SECURITY WARNING] ClamAV antivirus service tidak terdeteksi. File dilewatkan tanpa scan (Dev Mode).');
      return next();
    }

    // Error lain (bukan karena ClamAV mati)
    console.error('[VIRUS SCAN ERROR]', error);
    
    // Opsional: Hapus file jika gagal scan untuk keamanan maksimal
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(500).json({ ok: false, error: 'Gagal memindai keamanan file.' });
  }
};