// backend/src/routes/applications.ts

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
// Import ApplicationStatus
import { Prisma, ApplicationStatus } from '@prisma/client';
import fs from 'node:fs';
import { authRequired } from '../middleware/role';
import { uploadCV } from '../middleware/upload';

const router = Router();

// GET /api/users/applications
router.get('/users/applications', authRequired, async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const userId = auth?.userId || auth?.sub;

    if (!userId) {
      return res.status(401).json({ ok: false, error: 'UNAUTHENTICATED' });
    }

    const apps = await prisma.jobApplication.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
        status: true,
        cvUrl: true,
        cvFileName: true,
        cvFileType: true,
        cvFileSize: true,
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

    console.log('DEBUG: Prisma returned apps:', JSON.stringify(apps, null, 2));

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
    console.error(e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// POST /api/applications
router.post('/applications', authRequired, uploadCV.single('cv'), async (req: Request, res: Response) => {

  const cleanupFile = () => {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (err) { }
    }
  };

  try {
    const jobId = String(req.body?.jobId || '').trim();

    if (!jobId) {
      cleanupFile();
      return res.status(400).json({ ok: false, error: 'Job ID diperlukan.' });
    }

    const auth = (req as any).auth;
    const userId = auth?.userId || auth?.sub;

    if (!userId) {
      cleanupFile();
      return res.status(401).json({ ok: false, error: 'Anda harus login.' });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true, isHidden: true },
    });

    if (!job || !job.isActive || job.isHidden) {
      cleanupFile();
      return res.status(404).json({ ok: false, error: 'Lowongan tidak valid.' });
    }

    let cvData: null | { url: string; name: string; type: string; size: number } = null;
    if (req.file) {
      cvData = {
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      };
    }

    // --- BAGIAN YANG DIPERBAIKI ---
    const result = await prisma.jobApplication.upsert({
      where: {
        jobId_applicantId: { jobId, applicantId: userId }
      },
      create: {
        jobId,
        applicantId: userId,
        // Ganti PENDING ke submitted (sesuai skema database kamu)
        status: ApplicationStatus.submitted,
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
        // Ganti PENDING ke submitted juga disini
        status: ApplicationStatus.submitted,
      },
      include: {
        job: { select: { id: true, title: true } }
      },
    });
    // -----------------------------

    return res.json({
      ok: true,
      message: 'Lamaran berhasil dikirim.',
      data: {
        id: result.id,
        jobId: result.job.id,
        jobTitle: result.job.title,
        status: result.status,
        createdAt: result.createdAt,
        cv: result.cvUrl ? {
          url: result.cvUrl, name: result.cvFileName
        } : null,
      },
    });

  } catch (e: any) {
    if (e.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ ok: false, error: 'File terlalu besar.' });
    console.error(e);
    cleanupFile();
    return res.status(500).json({ ok: false, error: 'Gagal memproses lamaran.' });
  }
});

export default router;