// frontend/src/app/auth/signup_perusahaan/page.tsx
'use client';

import { useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Logo from '@/app/Images/Ungu__1_-removebg-preview.png';

/* --------------------------------- Config --------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

/* --------------------------------- Types --------------------------------- */
type Step = 1 | 2 | 3 | 4 | 5;

type PackageId = 'free' | 'starter' | 'basic' | 'business' | 'premium';
type Package = { id: PackageId; title: string; price: number; features: string[] };

type CompanyProfile = {
  logo?: string; // dataURL preview (opsional)
  name: string;
  email: string;
  website?: string;
  industry?: string;
  size?: string; // UI string, nanti di-map ke enum backend
  about?: string;
  address?: string;
  city?: string;
  socials: Partial<Record<'website' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'youtube', string>>;
};

type NewJob = {
  title: string;
  functionArea: string;
  level: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  workMode: 'onsite' | 'remote' | 'hybrid';
  location: string;
  deadline?: string;
  description: string;
  requirements: string;
  tags: string;
};

type SignupCompanyPayload = {
  companyName: string;
  email: string;
  password: string;
  website?: string;
};

/* ----------------------------- Static packages ---------------------------- */
const PACKAGES: Package[] = [
  { id: 'free', title: 'Free Trial', price: 0, features: ['1 job post', '7 hari aktif', 'Basic listing'] },
  { id: 'starter', title: 'Starter', price: 149000, features: ['3 job post', '14 hari', 'Highlight listing'] },
  { id: 'basic', title: 'Basic', price: 249000, features: ['5 job post', '30 hari', 'Badge + highlight'] },
  { id: 'business', title: 'Business', price: 499000, features: ['12 job post', '45 hari', 'Spotlight beranda'] },
  { id: 'premium', title: 'Premium', price: 899000, features: ['Unlimited aktif', '60 hari', 'Advanced analytics'] },
];

/* ------------------------------- Utilities -------------------------------- */
function cx(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(' ');
}
function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}
function normalizeUrl(u?: string) {
  const v = (u ?? '').trim();
  if (!v) return undefined;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
// Map ukuran UI → enum backend CompanySize
function mapSizeToEnum(ui?: string): string | undefined {
  switch ((ui ?? '').trim()) {
    case '1-10': return '_1_10';
    case '11-50': return '_11_50';
    case '51-200': return '_51_200';
    case '201-500': return '_201_500';
    case '500+':   return '_501_1000'; // fallback aman
    default: return undefined;
  }
}
// helper POST
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const j = await res.json();
      msg = j?.error || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/* --------------------------------- Page ---------------------------------- */
export default function Page() {
  const t = useTranslations('companySignup');

  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);

  /* ------------------------------ Step 1 form ----------------------------- */
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [website, setWebsite] = useState('');

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);

  const strong = pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

  async function onCreateCompany(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    if (!agree) return setError(t('error.agree'));
    if (pw !== confirm) return setError(t('error.mismatch'));
    if (company.trim().length < 2) return setError(t('error.company'));

    try {
      setBusy(true);
      setError(null);

      const payload: SignupCompanyPayload = {
        companyName: company.trim(),
        email: email.trim(),
        password: pw,
        website: normalizeUrl(website),
      };

      // Backend Step 1 (samakan dengan validator backend)
      const resp = await apiPost<{ ok: true; employerId: string; slug: string }>('/api/employers/step1', {
        companyName: payload.companyName,
        displayName: payload.companyName,
        email: payload.email,
        website: payload.website,
        password: payload.password,
        confirmPassword: confirm,
        agree: true,
      });

      setEmployerId(resp.employerId);
      setStep(2);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? t('error.default'));
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------ Step 2: Profil ------------------------------ */
  const [profile, setProfile] = useState<CompanyProfile>({
    name: '',
    email: '',
    website: '',
    industry: '',
    size: '',
    about: '',
    address: '',
    city: '',
    socials: {},
  });
  const fileRef = useRef<HTMLInputElement | null>(null);

  function validateStep2() {
    if (profile.name.trim().length < 2) return 'Nama perusahaan wajib diisi.';
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) return 'Email perusahaan tidak valid.';
    return null;
  }

  async function submitStep2() {
    const emsg = validateStep2();
    if (emsg) throw new Error(emsg);
    if (!employerId) throw new Error('EmployerId belum tersedia.');

    await apiPost('/api/employers/step2', {
      employerId,
      industry: profile.industry || undefined,
      size: mapSizeToEnum(profile.size),
      foundedYear: undefined,
      about: profile.about || undefined,
      hqCity: profile.city || undefined,
      hqCountry: undefined,
      logoUrl: undefined,   // kalau sudah upload ke storage, kirim URL-nya di sini
      bannerUrl: undefined,
    });
  }

  /* ------------------------------ Step 3: Paket ------------------------------ */
  const [selectedPkg, setSelectedPkg] = useState<PackageId>('free');
  const currentPkg = useMemo<Package | undefined>(() => PACKAGES.find((p) => p.id === selectedPkg), [selectedPkg]);

  async function submitStep3() {
    if (!employerId) throw new Error('EmployerId belum tersedia.');
    await apiPost('/api/employers/step3', {
      employerId,
      planSlug: selectedPkg,
    });
  }

  /* ----------------------------- Step 4: Job form ---------------------------- */
  const [job, setJob] = useState<NewJob>({
    title: '',
    functionArea: '',
    level: '',
    type: 'full_time',
    workMode: 'onsite',
    location: '',
    deadline: '',
    description: '',
    requirements: '',
    tags: '',
  });
  function validateStep4() {
    if (job.title.trim().length < 3) return 'Posisi pekerjaan wajib diisi.';
    if (job.location.trim().length < 2) return 'Lokasi wajib diisi.';
    if (job.description.trim().length < 10) return 'Deskripsi terlalu singkat.';
    return null;
  }

  async function submitStep4() {
    const emsg = validateStep4();
    if (emsg) throw new Error(emsg);
    if (!employerId) throw new Error('EmployerId belum tersedia.');

    // Backend job hanya menampung sebagian field → gabungkan sisanya ke deskripsi
    const extra = [
      job.functionArea && `Bidang: ${job.functionArea}`,
      job.level && `Level: ${job.level}`,
      job.workMode && `Mode: ${job.workMode}`,
      job.deadline && `Batas Lamar: ${job.deadline}`,
      job.requirements && `\n\nKualifikasi:\n${job.requirements}`,
      job.tags && `\n\nTags: ${job.tags}`,
    ].filter(Boolean).join('\n');

    await apiPost<{ ok: true; jobId: string }>('/api/employers/step4', {
      employerId,
      title: job.title.trim(),
      description: `${job.description}${extra ? `\n\n${extra}` : ''}`,
      location: job.location,
      employment: job.type.replace('_', '-'),
    });
  }

  /* -------------------------------- Submit step 5 ------------------------------- */
  async function onFinish(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!employerId) throw new Error('EmployerId belum tersedia.');

      // Step 2 → Step 3 → Step 4 kalau user lompat (guard)
      if (step <= 2) await submitStep2();
      if (step <= 3) await submitStep3();
      if (step <= 4) await submitStep4();

      // Step 5: Verifikasi (tanpa file dahulu)
      await apiPost('/api/employers/step5', {
        employerId,
        note: `Verifikasi otomatis dari UI. Company: ${profile.name}`,
        files: [],
      });

      alert('Data terkirim! Akun perusahaan akan diverifikasi.');
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Gagal mengirim.');
      return;
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------ Stepper UI ------------------------------ */
  const steps = [
    { n: 1, label: 'Buat Akun' },
    { n: 2, label: 'Profil' },
    { n: 3, label: 'Pilih Paket' },
    { n: 4, label: 'Pasang Lowongan' },
    { n: 5, label: 'Verifikasi' },
  ];

  /* --------------------------------- Render --------------------------------- */
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <Image src={Logo} alt="ArkWork Logo" width={72} height={72} className="mx-auto mb-4 h-14 w-14 object-contain" priority />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {step === 1 ? t('title') : 'Create Company Account'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {step === 1 ? t('subtitle') : 'Kelola lowongan & rekrut talenta terbaik di ArkWork.'}
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8 flex items-center justify-between">
            {steps.map(({ n, label }) => (
              <div key={n} className="flex flex-1 items-center">
                <div
                  className={cx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                    n <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {n}
                </div>
                <div className={cx('ml-3 text-sm', n <= step ? 'text-slate-900 font-medium' : 'text-slate-500')}>{label}</div>
                {n !== 5 && <div className="mx-4 h-[2px] flex-1 rounded bg-slate-200" />}
              </div>
            ))}
          </div>

          {/* Error (global) */}
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {error}
            </div>
          )}

          {/* ------------------------------- STEP 1 ------------------------------- */}
          {step === 1 && (
            <form onSubmit={onCreateCompany} noValidate className="grid grid-cols-1 gap-4">
              {/* Company */}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('form.company')}</span>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  placeholder={t('placeholder.company')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  autoComplete="organization"
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('form.email')}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={t('placeholder.email')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  inputMode="email"
                />
              </label>

              {/* Website */}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('form.website')}</span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={t('placeholder.website')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  inputMode="url"
                  autoComplete="url"
                />
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('form.password')}</span>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    minLength={8}
                    placeholder={t('placeholder.password')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                    aria-label={t('form.togglePw')}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2" aria-hidden="true">
                  <div className={`h-1 w-1/3 rounded ${pw.length >= 6 ? 'bg-amber-400' : 'bg-slate-200'}`} />
                  <div className={`h-1 w-1/3 rounded ${pw.length >= 8 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  <div className={`h-1 w-1/3 rounded ${strong ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
              </label>

              {/* Confirm */}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('form.confirm')}</span>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder={t('placeholder.confirm')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                    aria-label={t('form.toggleConfirm')}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {confirm.length > 0 && (
                  <p className={`mt-1 text-xs ${pw === confirm ? 'text-emerald-600' : 'text-rose-600'}`} role="status" aria-live="polite">
                    {pw === confirm ? t('match.ok') : t('match.no')}
                  </p>
                )}
              </label>

              {/* Agree */}
              <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-700 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-700 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="mr-2 inline-block animate-spin">⏳</span>
                    {t('creating')}
                  </>
                ) : (
                  t('createBtn')
                )}
              </button>
            </form>
          )}

          {/* ------------------------------- STEP 2 ------------------------------- */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {profile.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.logo} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">No logo</div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setProfile((p) => ({ ...p, logo: String(ev.target?.result || '') }));
                      reader.readAsDataURL(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Unggah Logo
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Nama Perusahaan</span>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="e.g. ArkWork Indonesia, Inc."
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Email Perusahaan</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="hr@company.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Industri</span>
                  <select
                    value={profile.industry}
                    onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Pilih industri</option>
                    <option>E-Commerce</option>
                    <option>Energy</option>
                    <option>Manufacturing</option>
                    <option>Financial Services</option>
                    <option>Technology</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Ukuran</span>
                  <select
                    value={profile.size}
                    onChange={(e) => setProfile((p) => ({ ...p, size: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Pilih ukuran</option>
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>201-500</option>
                    <option>500+</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Tentang perusahaan</span>
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile((p) => ({ ...p, about: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Visi, misi, budaya kerja, dsb."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Alamat kantor</span>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Jalan, nomor, dll."
                  />
                </label>
                <div className="grid gap-4">
                  <label className="block">
                    <span className="mb-1 block text-sm text-slate-600">Kota / Kabupaten</span>
                    <input
                      value={profile.city}
                      onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Jakarta Selatan"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-slate-600">Website (opsional)</span>
                    <input
                      value={profile.website}
                      onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      placeholder="company.com"
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Website & Sosial</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['website', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube'] as const).map((key) => (
                    <input
                      key={key}
                      value={profile.socials[key] || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, socials: { ...p.socials, [key]: e.target.value } }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      placeholder={key[0].toUpperCase() + key.slice(1)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setBusy(true);
                      setError(null);
                      await submitStep2();
                      setStep(3);
                    } catch (e: any) {
                      setError(e?.message || 'Gagal menyimpan profil.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? 'Menyimpan…' : 'Selanjutnya'}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------- STEP 3 ------------------------------- */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Pilih Paket</h2>
              <p className="mt-1 text-sm text-slate-600">Pilih paket sesuai kebutuhan. Bisa upgrade kapan saja.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PACKAGES.map((p) => {
                  const active = p.id === selectedPkg;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPkg(p.id)}
                      className={cx(
                        'text-left rounded-2xl border p-5 transition focus:outline-none',
                        active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <h3 className={cx('text-lg font-semibold', active ? 'text-blue-700' : 'text-slate-900')}>{p.title}</h3>
                        <div className={cx('text-sm', active ? 'text-blue-600' : 'text-slate-500')}>{formatIDR(p.price)}</div>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Paket dipilih</span>
                  <span className="font-semibold text-slate-900">{currentPkg?.title ?? '-'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">{currentPkg ? formatIDR(currentPkg.price) : '-'}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setBusy(true);
                      setError(null);
                      await submitStep3();
                      setStep(4);
                    } catch (e: any) {
                      setError(e?.message || 'Gagal memilih paket.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? 'Menyimpan…' : 'Selanjutnya'}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------- STEP 4 ------------------------------- */}
          {step === 4 && (
            <div className="grid gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Pasang Lowongan</h2>
                  <p className="mt-1 text-sm text-slate-600">Jelaskan posisi, bidang, dan kualifikasi agar kandidat tepat.</p>
                </div>
                <div className="hidden rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 md:block">
                  <div className="font-semibold">Tips</div>
                  <ul className="mt-1 list-disc pl-4">
                    <li>Gunakan judul spesifik</li>
                    <li>Jelaskan tanggung jawab & benefit</li>
                    <li>Tuliskan kualifikasi yang jelas</li>
                  </ul>
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Posisi Pekerjaan</span>
                <input
                  value={job.title}
                  onChange={(e) => setJob((j) => ({ ...j, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Masukan posisi pekerjaan"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Bidang Pekerjaan</span>
                <select
                  value={job.functionArea}
                  onChange={(e) => setJob((j) => ({ ...j, functionArea: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Pilih bidang pekerjaan</option>
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>HR</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Level</span>
                  <select
                    value={job.level}
                    onChange={(e) => setJob((j) => ({ ...j, level: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Pilih level</option>
                    <option>Intern</option>
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Manager</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Tipe Kerja</span>
                  <select
                    value={job.type}
                    onChange={(e) => setJob((j) => ({ ...j, type: e.target.value as NewJob['type'] }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Mode Kerja</span>
                  <select
                    value={job.workMode}
                    onChange={(e) => setJob((j) => ({ ...j, workMode: e.target.value as NewJob['workMode'] }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Lokasi</span>
                  <input
                    value={job.location}
                    onChange={(e) => setJob((j) => ({ ...j, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Jakarta / Surabaya / Remote"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">Batas Lamar (opsional)</span>
                  <input
                    type="date"
                    value={job.deadline}
                    onChange={(e) => setJob((j) => ({ ...j, deadline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Deskripsi</span>
                <textarea
                  value={job.description}
                  onChange={(e) => setJob((j) => ({ ...j, description: e.target.value }))}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Gambarkan tanggung jawab, budaya tim, benefit, dll."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Kualifikasi</span>
                <textarea
                  value={job.requirements}
                  onChange={(e) => setJob((j) => ({ ...j, requirements: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Contoh: 3+ tahun pengalaman React, terbiasa Next.js, dsb."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">Tags (pisahkan koma)</span>
                <input
                  value={job.tags}
                  onChange={(e) => setJob((j) => ({ ...j, tags: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="react, nextjs, tailwind"
                />
              </label>

              <div className="mt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setBusy(true);
                      setError(null);
                      await submitStep4();
                      setStep(5);
                    } catch (e: any) {
                      setError(e?.message || 'Gagal menyimpan lowongan.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? 'Menyimpan…' : 'Selanjutnya'}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------- STEP 5 ------------------------------- */}
          {step === 5 && (
            <div className="grid gap-6">
              <h2 className="text-xl font-semibold text-slate-900">Verifikasi & Ringkasan</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">Profil Perusahaan</div>
                  <dl className="space-y-2 text-sm">
                    <Row label="Nama">{profile.name}</Row>
                    <Row label="Email">{profile.email}</Row>
                    <Row label="Industri">{profile.industry || '-'}</Row>
                    <Row label="Ukuran">{profile.size || '-'}</Row>
                    <Row label="Kota">{profile.city || '-'}</Row>
                    <Row label="Website">{profile.website ? normalizeUrl(profile.website) : '-'}</Row>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">Paket</div>
                  <dl className="space-y-2 text-sm">
                    <Row label="Nama Paket">{currentPkg?.title ?? '-'}</Row>
                    <Row label="Harga">{currentPkg ? formatIDR(currentPkg.price) : '-'}</Row>
                    <Row label="Fitur">
                      <ul className="mt-1 list-disc pl-4">
                        {(currentPkg?.features ?? []).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </Row>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 md:col-span-2">
                  <div className="mb-3 text-sm font-semibold text-slate-900">Lowongan</div>
                  <dl className="grid gap-4 text-sm md:grid-cols-2">
                    <Row label="Posisi">{job.title}</Row>
                    <Row label="Bidang">{job.functionArea || '-'}</Row>
                    <Row label="Level">{job.level || '-'}</Row>
                    <Row label="Tipe">{job.type.replace('_', ' ')}</Row>
                    <Row label="Mode Kerja">{job.workMode}</Row>
                    <Row label="Lokasi">{job.location}</Row>
                    <Row label="Batas Lamar">{job.deadline || '-'}</Row>
                    <Row label="Tags">{job.tags || '-'}</Row>
                  </dl>
                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-slate-500">Deskripsi</div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-slate-500">Kualifikasi</div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{job.requirements}</p>
                  </div>
                </div>
              </div>

              {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onFinish}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {busy ? 'Mengirim…' : 'Kirim'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Small helper ------------------------------ */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-1 text-slate-500">{label}</div>
      <div className="col-span-2 font-medium text-slate-800">{children}</div>
    </div>
  );
}
