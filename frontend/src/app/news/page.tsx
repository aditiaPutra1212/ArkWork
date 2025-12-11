'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

/* ================= Types & simple client ================= */
type EnergyNewsItem = {
  title?: string;
  link?: string;
  pubDate?: string | null;
  source?: string | null;
  image?: string | null;
  description?: string | null;
  summary?: string | null;
};

type EnergyNewsResponse = {
  scope: string;
  country: string;
  when: string;
  count: number;
  items: EnergyNewsItem[];
};

async function fetchEnergyNews(params: {
  scope: 'id' | 'global' | 'both';
  limit: number;
  country: string;
  when: string;
  keywords?: string;
}): Promise<EnergyNewsResponse> {
  const q = new URLSearchParams();
  q.set('scope', params.scope);
  q.set('limit', String(params.limit));
  q.set('country', params.country);
  q.set('when', params.when);
  if (params.keywords?.trim()) q.set('keywords', params.keywords.trim());
  const r = await fetch(`/api/news/energy?${q.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ================= Page ================= */
export default function NewsPage() {
  const t = useTranslations();
  const [items, setItems] = useState<EnergyNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [scope, setScope] = useState<'id' | 'global' | 'both'>('id');
  const [limit, setLimit] = useState(15);
  const [country, setCountry] = useState<string>('ID');
  const [when, setWhen] = useState<'7d' | '14d' | '30d' | '48h'>('14d');
  const [keywords, setKeywords] = useState('');
  const [quick, setQuick] = useState('');

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short', day: '2-digit' }),
    []
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnergyNews({ scope, limit, country, when, keywords });
      setItems(data.items);
    } catch (e: any) {
      setError(e?.message ?? t('news.error.load'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = quick.trim().toLowerCase();
    if (!k) return items;
    return items.filter((it) =>
      (it.title ?? '').toLowerCase().includes(k) ||
      (it.source ?? '').toLowerCase().includes(k) ||
      (it.description ?? '').toLowerCase().includes(k) ||
      (it.summary ?? '').toLowerCase().includes(k)
    );
  }, [items, quick]);

  const getDomain = (url?: string) => {
    try {
      if (!url) return '';
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const summarize = (it: EnergyNewsItem) =>
    (it.summary || it.description || '').replace(/\s+/g, ' ').trim();

  const fmtDate = (s?: string | null) => {
    if (!s) return '';
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : dateFmt.format(d);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-emerald-950 tracking-tight">{t('news.title')}</h1>

        {/* Controls */}
        <div className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 md:grid-cols-7 md:gap-4 md:p-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.scope')}</span>
            <select
              className="w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
            >
              <option value="id">{t('news.filters.scopeOpt.id')}</option>
              <option value="global">{t('news.filters.scopeOpt.global')}</option>
              <option value="both">{t('news.filters.scopeOpt.both')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.country')}</span>
            <select
              className="w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              title="Pilih ALL untuk lintas negara"
            >
              <option value="ALL">{t('news.filters.countryOpt.all')}</option>
              <option value="ID">{t('news.filters.countryOpt.id')}</option>
              <option value="US">{t('news.filters.countryOpt.us')}</option>
              <option value="GB">{t('news.filters.countryOpt.gb')}</option>
              <option value="AE">{t('news.filters.countryOpt.ae')}</option>
              <option value="SG">{t('news.filters.countryOpt.sg')}</option>
              <option value="AU">{t('news.filters.countryOpt.au')}</option>
              <option value="CA">{t('news.filters.countryOpt.ca')}</option>
              <option value="DE">{t('news.filters.countryOpt.de')}</option>
              <option value="FR">{t('news.filters.countryOpt.fr')}</option>
              <option value="JP">{t('news.filters.countryOpt.jp')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.period')}</span>
            <select
              className="w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
              value={when}
              onChange={(e) => setWhen(e.target.value as any)}
            >
              <option value="7d">{t('news.filters.periodOpt.7d')}</option>
              <option value="14d">{t('news.filters.periodOpt.14d')}</option>
              <option value="30d">{t('news.filters.periodOpt.30d')}</option>
              <option value="48h">{t('news.filters.periodOpt.48h')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.limit')}</span>
            <select
              className="w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none bg-white"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[10, 15, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {t('news.filters.limitOpt', { n })}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.keywords')}</span>
            <input
              placeholder={t('news.filters.keywordsPh')}
              className="rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] opacity-0 select-none">{t('news.filters.fetchLabel')}</span>
            <button
              onClick={load}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 disabled:opacity-60 transition-colors"
              disabled={loading}
            >
              {loading ? t('news.filters.loading') : t('news.filters.fetchBtn')}
            </button>
          </div>

          <div className="md:col-span-3 flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600/80">{t('news.filters.quick')}</span>
            <input
              placeholder={t('news.filters.quickPh')}
              className="rounded-lg border border-emerald-100 px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
          <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 3v2h3.59L7 15.59 8.41 17 19 6.41V10h2V3zM5 5h6V3H3v8h2z" />
                <path d="M19 19H5V8H3v13h18V10h-2z" />
              </svg>
              <span className="font-semibold text-emerald-950">{t('news.list.title')}</span>
            </div>
            {quick && (
              <button onClick={() => setQuick('')} className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                {t('news.list.clearQuick')}
              </button>
            )}
          </div>

          {loading && (
            <div className="space-y-3 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2 border-b border-emerald-50 pb-4 last:border-none">
                  <div className="h-4 w-2/3 rounded bg-emerald-50" />
                  <div className="h-3 w-1/3 rounded bg-emerald-50" />
                  <div className="h-3 w-full rounded bg-slate-50" />
                </div>
              ))}
            </div>
          )}

          {!loading &&
            filtered.map((it, i) => (
              <article
                key={`${it.link}-${i}`}
                className="border-b border-emerald-50 px-5 py-5 last:border-none md:px-6 hover:bg-emerald-50/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <a href={it.link} target="_blank" rel="noreferrer" className="hover:underline group">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors md:text-lg">
                      {it.title}
                    </h3>
                  </a>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 font-medium">
                    {it.source || getDomain(it.link) || t('news.list.source')}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {summarize(it) || '…'}
                </p>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <time className="text-slate-500 font-medium">{fmtDate(it.pubDate || undefined)}</time>
                  <a
                    href={it.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                  >
                    {t('news.list.open')}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                      <path d="M5 5h6V3H3v8h2z" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
        </section>

        {!loading && !error && filtered.length === 0 && (
          <p className="mt-10 text-center text-slate-500">{t('news.list.empty')}</p>
        )}
      </div>
    </div>
  );
}
