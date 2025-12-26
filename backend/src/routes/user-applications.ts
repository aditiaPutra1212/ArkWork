// backend/src/routes/user-applications.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';
// UBAH IMPORT: Gunakan requireAuth yang sudah support Google & JWT
import { requireAuth } from '../middleware/requireAuth'; 

const router = Router();

/**
 * GET /api/users/applications
 * Return list lamaran milik user saat ini
 */
// GANTI middleware 'withUserSession' menjadi 'requireAuth'
router.get('/users/applications', requireAuth, async (req, res) => {
  try {
    // requireAuth yang baru sudah menyediakan req.user.id atau req.userId
    // Kita pakai fallback agar aman
    const userId = (req as any).userId || (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ ok: false, error: 'User ID not found in session' });
    }

    const apps = await prisma.jobApplication.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        jobId: true,
        status: true,
        createdAt: true,
        job: { select: { title: true, location: true } },
      },
    });

    const rows = apps.map((a) => ({
      jobId: a.jobId,
      title: a.job?.title ?? `Job ${a.jobId}`,
      location: a.job?.location ?? '-',
      appliedAt: a.createdAt,         // FE kita map ke appliedAt
      status: a.status,               // enum ApplicationStatus
    }));

    res.json({ ok: true, rows });
  } catch (e: any) {
    console.error('Error fetching applications:', e);
    res.status(500).json({ ok: false, error: e?.message || 'Internal error' });
  }
});

export default router;