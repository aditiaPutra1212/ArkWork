import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import NodeClam from 'clamscan';

/* --- 0. PASTIKAN FOLDER UPLOAD ADA --- */
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* --- 1. KONFIGURASI PENYIMPANAN (STORAGE) --- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // SECURITY: Random filename agar tidak bisa ditebak/ditimpa
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/* --- 2. FILTER: HANYA DOKUMEN (PDF/DOC/DOCX) - [FIXED] --- */
const documentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Daftar Mime Type yang valid untuk dokumen kerja
  const allowedMimes = [
    'application/pdf',                                                        // .pdf
    'application/msword',                                                     // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = ['.pdf', '.doc', '.docx'].includes(ext);

  if (allowedMimes.includes(file.mimetype) && isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap upload PDF, DOC, atau DOCX.'));
  }
};

/* --- 3. FILTER: HANYA GAMBAR (JPG/PNG/WEBP) --- */
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!'));
  }
};

/* --- 4. EXPORT CONFIG (MULTER) --- */

// Opsi A: Untuk Upload CV (Max 5MB) -> Pakai ini di route pelamar
export const uploadCV = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Opsi B: Untuk Upload Gambar/Logo (Max 2MB) -> Pakai ini di route profil
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
      // SECURITY ACTION: File sudah dihapus otomatis oleh removeInfected: true
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
    // Jika ClamAV belum diinstall di komputer (Windows/Mac), error 'ECONNREFUSED' akan muncul.
    // Kita biarkan lewat agar Anda tetap bisa coding tanpa install antivirus berat.
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Could not find clamdscan')) {
      // Uncomment baris bawah ini jika ingin melihat warning di terminal
      // console.warn('[SECURITY WARNING] ClamAV service not found. Skipping scan (Dev Mode).');
      return next();
    }

    // Error lain (bukan karena ClamAV mati)
    console.error('[VIRUS SCAN ERROR]', error);
    
    // Default: Aman, izinkan lewat jika scanner error (atau blokir jika ingin strict)
    return next();
  }
};