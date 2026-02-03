'use client';

import Nav from '@/components/nav';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

/* ------------------- Helpers ------------------- */
const API =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

/* ------------------- Types ------------------- */
interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  interviews: number;
}

interface ChartSeries {
  apps: number[];
  posted: number[];
  views: number[];
  labels: string[];
}

interface EmployerData {
  id: string;
  displayName: string;
  companyName: string;
  logoUrl: string | null;
}

/* ------- AreaChart Component (Tetap Sama) ------- */
function AreaChart({ data, height = 140, strokeWidth = 2, color = '#2563eb', fill = 'rgba(37, 99, 235, .12)', padding = 12 }: any) {
  const width = 520;
  const max = Math.max(...data, 1);
  const min = 0;
  const h = height - padding * 2;
  const w = width - padding * 2;
  const step = w / Math.max(data.length - 1, 1);
  const points = data.map((v: any, i: any) => [padding + i * step, padding + (1 - (v / max)) * h]);
  const path = points.map((p: any, i: any) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const area = `${path} L ${padding + (data.length - 1) * step} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <g opacity=".4">{[0, 1, 2, 3].map((i) => <line key={i} x1={padding} y1={padding + (i / 3) * h} x2={width - padding} y2={padding + (i / 3) * h} stroke="#e5e7eb" strokeWidth="1" />)}</g>
        <path d={area} fill={fill} /><path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
        {points.map(([x, y]: any, i: any) => <circle key={i} cx={x} cy={y} r="2.5" fill={color} />)}
      </svg>
    </div>
  );
}

export default function EmployerHome() {
  const t = useTranslations('emp.overview');

  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ activeJobs: 0, totalApplicants: 0, interviews: 0 });
  const [seriesData, setSeriesData] = useState<ChartSeries>({ apps: [], posted: [], views: [], labels: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = API.replace(/\/+$/, '');

        // 1. Ambil Profil Employer
        const resAuth = await fetch(`${base}/api/employers/auth/me`, { credentials: 'include' });
        const dataAuth = await resAuth.json();

        // 2. Ambil Statistik Dashboard (Endpoint yang baru kita perbaiki di Backend)
        const resDash = await fetch(`${base}/api/employers/dashboard`, { credentials: 'include' });
        const dataDash = await resDash.json();

        if (dataAuth.ok) {
          setEmployer({
            id: dataAuth.employer.id,
            displayName: dataAuth.employer.displayName,
            companyName: dataAuth.employer.legalName || dataAuth.employer.displayName,
            logoUrl: dataAuth.employer.logoUrl,
          });
        }

        // SET DATA REAL DARI BACKEND
        if (dataDash.stats) {
          setStats(dataDash.stats);
          setSeriesData(dataDash.series);
        }

      } catch (e) {
        console.error('Error loading dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: t('activeJobs'), value: stats.activeJobs },
    { label: t('totalApplicants'), value: stats.totalApplicants },
  ];

  return (
    <>
      <Nav />
      <main className="min-h-[85vh] bg-slate-50 relative overflow-hidden font-sans">
        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Header & Identity Card (Sama seperti sebelumnya) */}
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-950 tracking-tight">{t('title')}</h1>
              <p className="text-slate-600 mt-1">{t('subtitle')}</p>
            </div>
            <div className="inline-flex items-center gap-4 rounded-2xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm pl-3 pr-6 py-3 shadow-sm">
              <div className="relative h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center font-bold text-emerald-700">
                {employer?.logoUrl ? <img src={employer.logoUrl} className="rounded-xl object-cover h-full w-full" /> : employer?.displayName?.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 font-bold">{t('company')}</span>
                <span className="text-sm font-semibold text-slate-900">{loading ? '...' : employer?.displayName}</span>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid gap-5 sm:grid-cols-2 mb-8">
            {statCards.map((s, idx) => (
              <div key={idx} className="rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-1">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-950">{loading ? '-' : s.value}</p>
              </div>
            ))}
          </section>

          {/* Performance Charts - MENGGUNAKAN DATA REAL */}
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-emerald-950 mb-6">{t('performance')}</h3>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-3 min-h-[160px]">
                {/* Gunakan data seriesData.apps dari backend */}
                <AreaChart data={seriesData.apps.length > 0 ? seriesData.apps : [0, 0, 0, 0, 0, 0, 0]} height={180} />
              </div>

              {/* Grafik Lamaran */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase">{t('apps')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</p>
                <AreaChart data={seriesData.apps.length > 0 ? seriesData.apps : [0, 0, 0, 0, 0, 0, 0]} height={80} color="#2563eb" />
              </div>

              {/* Grafik Views */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase">{t('views')}</p>
                <p className="text-2xl font-bold text-amber-600">{seriesData.views.reduce((a, b) => a + b, 0)}</p>
                <AreaChart data={seriesData.views.length > 0 ? seriesData.views : [0, 0, 0, 0, 0, 0, 0]} height={80} color="#d97706" />
              </div>

              {/* Grafik Posted */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase">{t('posted')}</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.activeJobs}</p>
                <AreaChart data={seriesData.posted.length > 0 ? seriesData.posted : [0, 0, 0, 0, 0, 0, 0]} height={80} color="#059669" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}


