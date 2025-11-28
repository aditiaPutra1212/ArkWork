'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-white to-[#EFF6FF] dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-medium text-[#166534] shadow-sm ring-1 ring-[#16A34A]/20 dark:bg-white/5 dark:text-[#bbf7d0] dark:ring-[#16A34A]/40 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
            <span>{t('badge', { defaultMessage: 'About ArkWork' })}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#16A34A] via-[#0EA5E9] to-[#F97316] bg-clip-text text-transparent">
              {t('title')} ArkWork
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-neutral-300">
            {t('intro')}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Vision */}
          <div className="relative overflow-hidden rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-[#16A34A]/15 hover:-translate-y-1 hover:shadow-lg transition dark:bg-[#020617] dark:ring-[#16A34A]/30">
            <div className="absolute inset-x-0 -top-16 h-32 bg-gradient-to-br from-[#BBF7D0]/60 via-transparent to-[#0EA5E9]/40 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center rounded-2xl bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534] dark:bg-[#052e16] dark:text-[#bbf7d0] mb-4">
                💚 {t('vision.badge', { defaultMessage: 'Vision' })}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 dark:text-neutral-50">
                {t('vision.title')}
              </h2>
              <p className="text-gray-600 leading-relaxed dark:text-neutral-300">
                {t('vision.desc')}
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="relative overflow-hidden rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-[#0EA5E9]/20 hover:-translate-y-1 hover:shadow-lg transition dark:bg-[#020617] dark:ring-[#0EA5E9]/40">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#0EA5E9]/60 via-[#F97316]/50 to-transparent blur-sm pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center rounded-2xl bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1D4ED8] dark:bg-[#1e293b] dark:text-[#bfdbfe] mb-4">
                💙 {t('mission.badge', { defaultMessage: 'Mission' })}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 dark:text-neutral-50">
                {t('mission.title')}
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 dark:text-neutral-300">
                <li>{t('mission.points.1')}</li>
                <li>{t('mission.points.2')}</li>
                <li>{t('mission.points.3')}</li>
                <li>{t('mission.points.4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3 dark:text-neutral-50">
            {t('values.title')}
          </h2>
          <p className="text-sm text-center text-gray-600 mb-8 max-w-2xl mx-auto dark:text-neutral-300">
            {t('values.subtitle', {
              defaultMessage:
                'Nilai inti yang menjadi fondasi ArkWork dalam membangun ekosistem talent energi & oil and gas.',
            })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { k: 'integrity' as const, color: 'green' },
              { k: 'innovation' as const, color: 'blue' },
              { k: 'collaboration' as const, color: 'orange' },
              { k: 'quality' as const, color: 'neutral' },
            ].map(({ k, color }) => {
              const colorClass =
                color === 'green'
                  ? 'border-[#16A34A]/40 bg-[#F0FDF4]'
                  : color === 'blue'
                  ? 'border-[#0EA5E9]/40 bg-[#EFF6FF]'
                  : color === 'orange'
                  ? 'border-[#F97316]/40 bg-[#FFF7ED]'
                  : 'border-neutral-200 bg-white';

              const dotColor =
                color === 'green'
                  ? 'bg-[#16A34A]'
                  : color === 'blue'
                  ? 'bg-[#0EA5E9]'
                  : color === 'orange'
                  ? 'bg-[#F97316]'
                  : 'bg-neutral-400';

              return (
                <div
                  key={k}
                  className={`group rounded-2xl border ${colorClass} p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition dark:bg-[#020617] dark:border-neutral-700`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-50">
                      {t(`values.items.${k}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-neutral-300">
                    {t(`values.items.${k}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#16A34A] via-[#0EA5E9] to-[#22C55E] px-6 py-10 sm:px-10 text-center shadow-lg">
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[#F97316]/40 blur-2xl opacity-60" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('closing.title')}
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto mb-6">
              {t('closing.desc')}
            </p>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm sm:text-base font-semibold text-[#166534] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
            >
              {t('closing.cta')}
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[11px]">
                💚
              </span>
            </Link>

            <p className="mt-4 text-xs text-white/80">
              {t('closing.subnote', {
                defaultMessage: 'Bangun karier Anda di sektor energi & oil and gas bersama ArkWork.',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
