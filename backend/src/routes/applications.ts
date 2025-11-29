import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired } from '../middleware/role';
import { Prisma } from '@prisma/client';
import fs from 'node:fs';
import { uploadCV } from '../middleware/upload';

const router = Router();

/**
 * GET /api/users/applications
 * List aplikasi user login
 */
router.get('/users/applications', authRequired, async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth as { uid?: string };
    const userId = auth?.uid;
    if (!userId) return res.status(401).json({ ok: false, error: 'UNAUTHENTICATED' });

    const apps = await prisma.jobApplication.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employment: true,
            employer: { select: { displayName: true } },
          },
        },
      },
    });

    const rows = apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      title: a.job?.title ?? `Job ${a.jobId}`,
      location: a.job?.location ?? '-',
      employment: a.job?.employment ?? '-',
      company: a.job?.employer?.displayName ?? 'Company',
      appliedAt: a.createdAt,
      status: a.status,
      cv: a.cvUrl
        ? {
            url: a.cvUrl,
            name: a.cvFileName,
            type: a.cvFileType,
            size: a.cvFileSize,
          }
        : null,
    }));

    return res.json({ ok: true, rows });
  } catch (e: any) {
    console.error('[GET /api/users/applications] error:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/applications
 * Endpoint melamar kerja + Upload CV Aman
 */

router.post('/applications', authRequired, uploadCV.single('cv'), async (req: Request, res: Response) => {
  
  // Helper: Hapus file jika validasi gagal (agar server tidak penuh sampah)
  const cleanupFile = () => {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
  };

  try {
    const jobId = String(req.body?.jobId || '').trim();
    
    // 1. Validasi Job ID
    if (!jobId) {
      cleanupFile();
      return res.status(400).json({ ok: false, error: 'jobId required' });
    }

    // 2. Validasi User
    const user = (req as any).auth as { uid: string };
    const userId = user?.uid;
    if (!userId) {
      cleanupFile();
      return res.status(401).json({ ok: false, error: 'UNAUTHENTICATED' });
    }

    // 3. Cek Status Job di Database
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true, isHidden: true, title: true },
    });

    if (!job || !job.isActive || job.isHidden) {
      cleanupFile();
      return res.status(404).json({ ok: false, error: 'Job not found, closed, or hidden.' });
    }

    // 4. Siapkan Data CV (Jika ada file yang lolos upload)
    let cvData: null | { url: string; name: string; type: string; size: number } = null;
    
    if (req.file) {
      // req.file.filename sudah diacak otomatis oleh middleware upload.ts
      cvData = {
        url: `/uploads/${req.file.filename}`, 
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      };
    }

    // 5. Simpan ke Database (Upsert: Create or Update)
    type AppWithJob = Prisma.JobApplicationGetPayload<{
      include: { job: { select: { id: true; title: true } } };
    }>;

    const result: AppWithJob = await prisma.jobApplication.upsert({
      where: { jobId_applicantId: { jobId, applicantId: userId } },
      create: {
        jobId,
        applicantId: userId,
        ...(cvData ? {
          cvUrl: cvData.url,
          cvFileName: cvData.name,
          cvFileType: cvData.type,
          cvFileSize: cvData.size,
        } : {}),
      },
      update: {
        // Jika upload file baru, update data CV. Jika tidak, biarkan yang lama.
        ...(cvData ? {
          cvUrl: cvData.url,
          cvFileName: cvData.name,
          cvFileType: cvData.type,
          cvFileSize: cvData.size,
        } : {}),
        updatedAt: new Date(),
      },
      include: { job: { select: { id: true, title: true } } },
    });

    return res.json({
      ok: true,
      data: {
        id: result.id,
        jobId: result.job.id,
        jobTitle: result.job.title,
        status: result.status,
        createdAt: result.createdAt,
        cv: result.cvUrl ? {
          url: result.cvUrl,
          name: result.cvFileName,
          type: result.cvFileType,
          size: result.cvFileSize
        } : null,
      },
    });

  } catch (e: any) {
    // ⚠️ Error Handling Khusus Multer (Dari Middleware Upload)
    if (e.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ ok: false, error: 'Ukuran CV terlalu besar (Max 5MB).' });
    }
    // Error jika format bukan PDF/Doc
    if (e.message?.includes('Hanya file dokumen')) {
      return res.status(400).json({ ok: false, error: e.message });
    }

    if (e?.code === 'P2002') {
      return res.status(409).json({ ok: false, error: 'Anda sudah melamar pekerjaan ini.' });
    }

    console.error('[POST /api/applications] error:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

export default router;