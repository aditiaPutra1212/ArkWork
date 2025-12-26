// backend/src/routes/applications.ts

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
    // 👇 PERBAIKAN DI SINI: Gunakan userId, bukan uid
    const auth = (req as any).auth; 
    const userId = auth?.userId; 

    // Debugging (Opsional, hapus nanti)
    // console.log('[DEBUG Applications] Auth Data:', auth);

    if (!userId) {
        return res.status(401).json({ ok: false, error: 'UNAUTHENTICATED (User ID missing)' });
    }

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
  
  const cleanupFile = () => {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
  };

  try {
    const jobId = String(req.body?.jobId || '').trim();
    
    if (!jobId) {
      cleanupFile();
      return res.status(400).json({ ok: false, error: 'jobId required' });
    }

    // 👇 PERBAIKAN DI SINI JUGA: Gunakan userId
    const user = (req as any).auth;
    const userId = user?.userId;

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

    // 4. Siapkan Data CV
    let cvData: null | { url: string; name: string; type: string; size: number } = null;
    
    if (req.file) {
      cvData = {
        url: `/uploads/${req.file.filename}`, 
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      };
    }

    // 5. Simpan ke Database
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
    if (e.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ ok: false, error: 'Ukuran CV terlalu besar (Max 5MB).' });
    }
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