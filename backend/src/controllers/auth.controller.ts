import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendPasswordResetEmail } from '../lib/mailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/* HELPER: Membuat Hash SHA-256
   Token asli dikirim ke email, token hash disimpan di DB.
   Jika DB bocor, hacker tidak bisa pakai tokennya.
*/
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/* 1. FORGOT PASSWORD */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // 1. Cari User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Security: Jangan beri tahu jika email tidak ditemukan
    if (!user) {
      return res.status(200).json({ 
        message: 'Jika email terdaftar, instruksi reset password akan dikirim.' 
      });
    }

    // 2. Generate Token Aman (Random Bytes) & Hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken); 

    // 3. Set Expiry 15 Menit (Sesuai Schema Anda)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    // 4. Simpan ke DB (Sesuai nama kolom Schema Anda: resetToken)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: tokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    });

    // 5. Buat Link Reset
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Kita kirim rawToken (yang belum di-hash) ke email user
    const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    // 6. Kirim Email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    } catch (emailError) {
      console.error('[AUTH][RESET] Gagal kirim email:', emailError);
      // Bersihkan token jika gagal kirim
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiresAt: null },
      });
      return res.status(500).json({ message: 'Gagal mengirim email. Silakan coba lagi.' });
    }

    return res.status(200).json({ 
      message: 'Jika email terdaftar, instruksi reset password akan dikirim.' 
    });

  } catch (error) {
    console.error('[AUTH][FORGOT] Error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/* 2. VERIFY TOKEN (Opsional - Dipakai Frontend saat loading page reset) */
export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) return res.status(400).json({ message: 'Token tidak ditemukan.' });

  try {
    const tokenHash = hashToken(token);

    // Cari user dengan token hash tersebut DAN belum expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() }, // gt = greater than (belum lewat)
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link reset password tidak valid atau sudah kedaluwarsa.' });
    }

    return res.status(200).json({ message: 'Token valid.' });

  } catch (error) {
    console.error('[AUTH][VERIFY] Error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

/* 3. RESET PASSWORD */
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token dan password baru wajib diisi.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter.' });
  }

  try {
    const tokenHash = hashToken(token);

    // 1. Cari User Valid
    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link reset password tidak valid atau sudah kedaluwarsa.' });
    }

    // 2. Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update User & Hapus Token (Invalidate)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,   // Hapus token agar tidak bisa dipakai lagi
        resetTokenExpiresAt: null,
      },
    });

    return res.status(200).json({ message: 'Password berhasil diubah. Silakan login.' });

  } catch (error) {
    console.error('[AUTH][RESET] Error:', error);
    return res.status(500).json({ message: 'Gagal mereset password.' });
  }
};