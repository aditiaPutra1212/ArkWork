// src/controllers/employer.Controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Pastikan path ini benar (cek folder lib mas)
import fs from 'fs';

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    // 1. Validasi User Login (Sesuaikan dengan middleware auth Mas)
    // Biasanya tersimpan di req.user atau req.employer
    const employerId = (req as any).user?.id || (req as any).employer?.id; 

    if (!employerId) {
      return res.status(401).json({ message: "Unauthorized: Silakan login ulang" });
    }

    // 2. Cek File
    if (!req.file) {
      return res.status(400).json({ message: "File logo tidak ditemukan" });
    }

    // 3. Path File untuk Database (misal: /uploads/logos/logo-123.png)
    const fileUrl = `/uploads/logos/${req.file.filename}`;

    // 4. Simpan ke Database (Upsert: Update jika ada, Create jika belum)
    await prisma.employerProfile.upsert({
      where: { employerId: employerId },
      create: {
        employerId: employerId,
        logoUrl: fileUrl,
        // Isi field wajib lain default jika perlu (misal: companyName diambil dari user)
      },
      update: {
        logoUrl: fileUrl
      }
    });

    return res.status(200).json({ 
      message: "Logo berhasil disimpan", 
      logoUrl: fileUrl 
    });

  } catch (error) {
    console.error("Error upload logo:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateBasic = async (req: Request, res: Response) => {
  try {
    const { employerId, displayName, website, size, about, hqCity } = req.body;
    if (!employerId) {
      return res.status(400).json({ ok: false, message: "Employer ID is missing" });
    }

    // Update ke Database Prisma
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