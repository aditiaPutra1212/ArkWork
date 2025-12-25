'use client';

import { useState } from 'react';
import Nav from '@/components/nav';
import { useTranslations } from 'next-intl';


export default function CompanyProfilePage() {
  const t = useTranslations('emp.companyProfile');
  const [form, setForm] = useState({
    name: 'PT Contoh Sejahtera',
    website: 'https://contoh.co.id',
    size: '51-200',
    about: 'Kami perusahaan teknologi fokus pada produk B2B...',
    address: 'Jakarta Selatan',
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(t('alert'));
  }

  return (
    <>
      <Nav />
      <main className="min-h-[60vh] bg-slate-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />

        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-semibold text-emerald-950">{t('title')}</h1>
          <p className="mb-6 text-sm text-slate-600">{t('subtitle')}</p>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">{t('fields.name')}</span>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('fields.website')}</span>
                <input
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">{t('fields.size')}</span>
                <select
                  value={form.size}
                  onChange={(e) => set('size', e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">{t('fields.address')}</span>
              <input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">{t('fields.about')}</span>
              <textarea
                value={form.about}
                onChange={(e) => set('about', e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              />
            </label>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => history.back()}
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all"
              >
                {t('buttons.save')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
