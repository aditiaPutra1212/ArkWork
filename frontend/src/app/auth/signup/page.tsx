'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/app/Images/Ungu__1_-removebg-preview.png';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strong =
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    if (!agree) return setError('Anda harus menyetujui syarat & ketentuan.');
    if (pw !== confirm) return setError('Konfirmasi password tidak cocok.');
    if (!name.trim()) return setError('Nama tidak boleh kosong.');

    try {
      setBusy(true);
      setError(null);
      await signup(name.trim(), email.trim(), pw);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Gagal mendaftar.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_60%)] from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_10px_50px_rgba(2,6,23,0.08)] ring-1 ring-slate-100/60">
          {/* dekorasi */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

          {/* Header */}
          <div className="px-8 pt-8 text-center">
            <Image
              src={Logo}
              alt="ArkWork Logo"
              width={96}
              height={96}
              className="mx-auto mb-5 h-20 w-20 object-contain drop-shadow-sm"
              priority
            />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Buat Akun
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Daftar untuk mulai melamar pekerjaan di ArkWork.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mx-8 mt-5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <div className="px-8 pb-8 pt-6">
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">Nama</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama lengkap"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  autoComplete="name"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                    aria-label="Tampilkan password"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2" aria-hidden>
                  <div
                    className={`h-1 w-1/3 rounded ${
                      pw.length >= 6 ? 'bg-amber-400' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1 w-1/3 rounded ${
                      pw.length >= 8 ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1 w-1/3 rounded ${
                      strong ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Gunakan kombinasi huruf besar, kecil, dan angka.
                </p>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">
                  Konfirmasi Password
                </span>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                    aria-label="Tampilkan konfirmasi"
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {confirm.length > 0 && (
                  <p
                    className={`mt-1 text-xs ${
                      pw === confirm ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {pw === confirm ? 'Cocok' : 'Tidak cocok'}
                  </p>
                )}
              </label>

              <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  Saya menyetujui{' '}
                  <Link href="/terms" className="text-blue-700 hover:underline">
                    Syarat Layanan
                  </Link>{' '}
                  dan{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-700 hover:underline"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="mr-2 inline-block animate-spin">⏳</span>
                    Membuat akun…
                  </>
                ) : (
                  'Buat Akun'
                )}
              </button>

              <p className="mt-6 text-center text-sm text-slate-600">
                Sudah punya akun?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
