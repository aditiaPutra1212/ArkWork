import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma'; 

// --- 1. UPLOAD LOGO ---
export const uploadLogo = async (req: Request, res: Response) => {
  try {
    // Coba ambil ID dari Body (FormData) ATAU dari Session/Auth
    const employerId = req.body.employerId || (req as any).user?.id || (req as any).employer?.id;

    if (!employerId) {
      // Hapus file yang terlanjur ter-upload jika tidak ada ID, agar tidak nyampah
      if (req.file) fs.unlinkSync(req.file.path); 
      return res.status(401).json({ ok: false, message: "Unauthorized: ID Perusahaan tidak ditemukan." });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Tidak ada file gambar yang diunggah." });
    }

    // --- PERBAIKAN PATH URL ---
    // Menggunakan nama file yang digenerate oleh Multer.
    // Asumsi di index.ts: app.use('/uploads', express.static('public/uploads'))
    // Kita hardcode path agar sesuai dengan folder penyimpanan 'employers'
    const filename = req.file.filename;
    
    // PENTING: Gunakan forward slash (/) bukan backslash (\) agar terbaca browser
    const logoUrl = `/uploads/employers/${filename}`;

    // --- UPDATE DATABASE ---
    // Kita update tabel 'Employer' langsung (sesuai fungsi updateBasic di bawah)
    const updatedEmployer = await prisma.employer.update({
      where: { id: employerId },
      data: { 
        logoUrl: logoUrl 
      }
    });

    return res.json({ 
      ok: true, 
      message: "Logo berhasil disimpan", 
      logoUrl: updatedEmployer.logoUrl 
    });

  } catch (error) {
    console.error("Error upload logo:", error);
    return res.status(500).json({ ok: false, message: "Gagal menyimpan logo ke database." });
  }
};

// --- 2. UPDATE BASIC PROFILE ---
export const updateBasic = async (req: Request, res: Response) => {
  try {
    const { employerId, displayName, website, size, about, hqCity } = req.body;

    if (!employerId) {
      return res.status(400).json({ ok: false, message: "Employer ID is missing" });
    }

    // Update ke Database Prisma
    // Pastikan field 'size' di database tipe String. Jika Int, perlu parseInt(size)
    const updated = await prisma.employer.update({
      where: { id: employerId },
      data: {
        displayName: displayName, 
        website: website,
        size: size,
        about: about,
        hqCity: hqCity 
      }
    });

    return res.json({ ok: true, data: updated });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ ok: false, message: "Server error updating profile" });
  }
};

// --- 3. GET PROFILE (Opsional, untuk memastikan data terambil) ---
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { employerId } = req.query; // Atau dari params/auth
        
        if (!employerId || typeof employerId !== 'string') {
            return res.status(400).json({ ok: false, message: "ID diperlukan" });
        }

        const employer = await prisma.employer.findUnique({
            where: { id: employerId }
        });

        if (!employer) {
            return res.status(404).json({ ok: false, message: "Employer tidak ditemukan" });
        }

        res.json({ ok: true, data: employer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Error fetch profile" });
    }
}