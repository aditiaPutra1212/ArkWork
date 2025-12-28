import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { subDays, startOfDay, format } from 'date-fns';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Prioritaskan req.employerId dari middleware attachEmployerId
    const employerId = (req as any).employerId || (req as any).user?.employerId || (req as any).user?.id;

    if (!employerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Hitung Lowongan Aktif (Menggunakan isActive sesuai schema)
    const activeJobsCount = await prisma.job.count({
      where: {
        employerId,
        isActive: true, // Berdasarkan schema: model Job { isActive Boolean }
        deletedAt: null
      }
    });

    // 2. Hitung Total Pelamar
    const totalApplicantsCount = await prisma.jobApplication.count({
      where: { job: { employerId } }
    });

    // 3. Hitung Wawancara (Menggunakan status 'shortlist' sesuai enum schema)
    const interviewCount = await prisma.jobApplication.count({
      where: {
        job: { employerId },
        status: 'shortlist' // Berdasarkan enum ApplicationStatus di schema
      }
    });

    // 4. Data Performa 7 Hari Terakhir
    const last7Days = [...Array(7)].map((_, i) => startOfDay(subDays(new Date(), i))).reverse();

    const performanceData = await Promise.all(last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      // Hitung Lamaran Masuk per hari
      const apps = await prisma.jobApplication.count({
        where: {
          job: { employerId },
          createdAt: { gte: date, lt: nextDay }
        }
      });

      // Hitung Lowongan Dipasang per hari
      const posted = await prisma.job.count({
        where: {
          employerId,
          createdAt: { gte: date, lt: nextDay }
        }
      });

      // Hitung Views (Sekarang bisa karena ada model JobView di schema)
      const views = await prisma.jobView.count({
        where: {
          job: { employerId },
          createdAt: { gte: date, lt: nextDay }
        }
      });

      return {
        date: format(date, 'yyyy-MM-dd'),
        apps,
        posted,
        views
      };
    }));

    res.json({
      stats: {
        activeJobs: activeJobsCount,
        totalApplicants: totalApplicantsCount,
        interviews: interviewCount
      },
      series: {
        apps: performanceData.map(d => d.apps),
        posted: performanceData.map(d => d.posted),
        views: performanceData.map(d => d.views),
        labels: performanceData.map(d => d.date)
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};