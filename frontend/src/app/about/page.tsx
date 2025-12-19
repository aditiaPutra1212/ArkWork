'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import ArkHero from '@/app/Images/3.jpg';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function AboutPage() {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-emerald-50">
            {/* ====== HEADER / TENTANG KAMI (PAKAI GAMBAR) ====== */}
            <section className="relative isolate overflow-hidden bg-emerald-900">
                {/* background image */}
                <div className="absolute inset-0 -z-10">
                    <Image
                        src={ArkHero}
                        alt="ArkWork Energy Background"
                        fill
                        priority
                        className="object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/85 to-emerald-900/60" />
                </div>

                <div className="mx-auto max-w-6xl px-6 py-16">
                    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xs font-semibold tracking-[0.28em] text-emerald-300 uppercase"
                        >
                            {t('about.header.badge')}
                        </motion.p>

                        <motion.h1
                            variants={fadeInUp}
                            className="mt-4 max-w-3xl text-3xl md:text-4xl xl:text-5xl font-semibold text-white"
                        >
                            {t('about.header.title.1')}
                            <span className="block mt-2 text-emerald-100">
                {t('about.header.title.2')}
              </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="mt-6 max-w-2xl text-base leading-relaxed text-emerald-100/90"
                        >
                            {t('about.header.desc')}
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* ====== CONTENT ====== */}
            <main className="mx-auto max-w-6xl px-6 py-16 space-y-20">
                {/* ====== VISION & MISSION ====== */}
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid gap-10 md:grid-cols-2"
                >
                    {/* Vision */}
                    <motion.div
                        variants={fadeInUp}
                        className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-200"
                    >
                        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
                            {t('about.vision.badge')}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold text-slate-900">
                            {t('about.vision.title')}
                        </h2>
                        <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                            {t('about.vision.desc')}
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        variants={fadeInUp}
                        className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-200"
                    >
                        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
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
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold text-emerald-900">
                            {t('about.values.title')}
                        </h2>
                        <p className="mt-2 max-w-xl text-sm text-slate-700">
                            {t('about.values.desc')}
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                                whileHover={{ y: -4 }}
                                className="rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-emerald-200"
                            >
                                <h3 className="text-sm font-semibold text-slate-900">
                                    {v.title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                    {v.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ====== CTA (HIJAU TANPA GAMBAR) ====== */}
                <section>
                    <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-10 py-14 text-white shadow-lg">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold tracking-widest uppercase text-emerald-200">
                                    {t('about.cta.badge')}
                                </p>
                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold">
                                    {t('about.cta.title')}
                                </h2>
                                <p className="mt-3 text-sm text-emerald-50/90">
                                    {t('about.cta.desc')}
                                </p>
                            </div>

                            <Link
                                href="/jobs"
                                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50 transition"
                            >
                                {t('about.cta.button')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
