'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ArkHero from '@/app/Images/3.jpg';
import CtaBg from '@/app/Images/pngtree-a-closeup-of-pipelines-in-oil-and-gas-engineering-and-industrial-image_15671495.jpg';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  const t = useTranslations();
  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-50/30">
      {/* ====== GLOBAL BACKGROUND DECORATION (GRID + BLUR) ====== */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* top blur */}
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[380px] w-[380px] rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      {/* ====== HEADER DENGAN BACKGROUND GAMBAR ====== */}
      <section className="relative isolate overflow-hidden border-b border-emerald-800 bg-gradient-to-r from-emerald-900 to-emerald-800">
        {/* background image + overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src={ArkHero}
            alt="ArkWork energy background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%] opacity-40"
          />
          {/* gradient supaya kiri terang (buat teks), kanan sedikit hijau */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/80 to-emerald-900/40" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-14">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs font-semibold tracking-[0.28em] text-emerald-300 uppercase"
            >
              {t('about.header.badge')}
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="mt-3 max-w-3xl text-3xl md:text-4xl xl:text-5xl font-semibold tracking-tight text-white"
            >
              {t('about.header.title.1')}
              <span className="block mt-2 text-emerald-100">
                {t('about.header.title.2')}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-100/90"
            >
              {t('about.header.desc')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ====== CONTENT ====== */}
      <main className="relative mx-auto max-w-6xl px-6 py-16 space-y-20">
        {/* ====== VISION & MISSION ====== */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid gap-10 md:grid-cols-2"
        >
          {/* VISION */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-100/50 hover:ring-emerald-200 transition-all"
          >
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
              {t('about.vision.badge')}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {t('about.vision.title')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {t('about.vision.desc')}
            </p>
          </motion.div>

          {/* MISSION */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-100/50 hover:ring-emerald-200 transition-all"
          >
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
              {t('about.mission.badge')}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
              <li>• {t('about.mission.points.1')}</li>
              <li>• {t('about.mission.points.2')}</li>
              <li>• {t('about.mission.points.3')}</li>
              <li>• {t('about.mission.points.4')}</li>
            </ul>
          </motion.div>
        </motion.section>

        {/* ====== CORE VALUES ====== */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              {t('about.values.title')}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-700">
              {t('about.values.desc')}
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: t('about.values.items.integrity.title'),
                desc: t('about.values.items.integrity.desc'),
              },
              {
                title: t('about.values.items.innovation.title'),
                desc: t('about.values.items.innovation.desc'),
              },
              {
                title: t('about.values.items.collaboration.title'),
                desc: t('about.values.items.collaboration.desc'),
              },
              {
                title: t('about.values.items.quality.title'),
                desc: t('about.values.items.quality.desc'),
              },
            ].map((v) => (
              <motion.div
                key={v.title}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-emerald-100/50 hover:shadow-md hover:ring-emerald-200 transition"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ====== CTA ====== */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-10 py-14 text-white shadow-xl isolate">
            {/* background image */}
            <div className="absolute inset-0 -z-10">
              <Image
                src={CtaBg}
                alt="Oil and gas pipelines"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
            </div>

            {/* decoration (removed green blobs) */}

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-300">
                  {t('about.cta.badge')}
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight">
                  {t('about.cta.title')}
                </h2>
                <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                  {t('about.cta.desc')}
                </p>
              </div>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-md hover:bg-emerald-50 transition"
              >
                {t('about.cta.button')}
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
