import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

// Helper untuk mendapatkan User ID dari berbagai kemungkinan sumber (Session/Token)
function getUserId(req: any): string | null {
  // 1. Cek dari Passport Session (req.user)
  if (req.user && req.user.id) return req.user.id;
  
  // 2. Cek dari Custom Middleware (req.auth)
  if (req.auth && req.auth.userId) return req.auth.userId;

  return null;
}

// GET: Ambil data profile lengkap
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      logger.warn('Get Profile Failed: No User ID found in session');
      return res.status(401).json({ error: 'Unauthorized: Session not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        profile: {
          select: {
            location: true,
            phone: true,
            headline: true,
            about: true,
            skills: true,
            experience: true,
            education: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found in DB' });

    const formattedUser = {
      ...user,
      ...(user.profile || {}),
    };

    res.json({ ok: true, data: formattedUser });
  } catch (error) {
    logger.error('Get Profile Error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT: Update data profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, location, phone, about, skills, experience } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update User
      const user = await tx.user.update({
        where: { id: userId },
        data: { name },
      });

      // 2. Update Profile
      const profile = await tx.userProfile.upsert({
        where: { userId: userId },
        create: {
          userId,
          location,
          phone,
          about,
          skills,
          experience
        },
        update: {
          location,
          phone,
          about,
          skills,
          experience
        }
      });

      return { ...user, profile };
    });

    res.json({ ok: true, data: updated, message: 'Profil berhasil disimpan.' });
  } catch (error) {
    logger.error('Update Profile Error', { error });
    res.status(500).json({ error: 'Gagal update profile' });
  }
};
