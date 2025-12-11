"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import ArkHero from "@/app/Images/1.jpg";
import Team1 from "@/app/Images/team1.jpg";
import Team2 from "@/app/Images/team2.jpg";

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* ========== HERO (PAKAI BACKGROUND FOTO) ========== */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Background image */}
        <div className="absolute inset-0 -z-20 bg-emerald-950">
          <Image
            src={ArkHero}
            alt="ArkWork Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-slate-950/65" />

          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: "radial-gradient(#34d399 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />
        </div>

        {/* soft radial glows hijau + biru - Animated */}
        <motion.div
          className="absolute inset-0 -z-10 opacity-90"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage:
              "radial-gradient(900px 480px at 10% -10%, rgba(16,185,129,0.52), transparent), radial-gradient(800px 420px at 90% 0%, rgba(56,189,248,0.4), transparent)",
          }}
        />

        {/* content */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-18 md:py-24 text-center">
          {/* small badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-50 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              {t("cta.energy")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="hero-title"
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight"
          >
            {t("home.hero.title.1")}{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-100 bg-clip-text text-transparent">
              {t("home.hero.title.2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-lg md:text-xl text-slate-100/90 max-w-2xl mx-auto leading-relaxed"
          >
            {t("home.hero.desc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
          >
            <a
              href="/jobs"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-7 py-3 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:translate-y-[1px] transition"
            >
              {t("home.hero.cta.jobs")}
            </a>
            <a
              href="/applications"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50/10 px-7 py-3 text-emerald-50 font-semibold backdrop-blur hover:bg-emerald-50/20 hover:border-emerald-100/90 transition"
            >
              {t("home.hero.cta.companies")}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ========== ABOUT JOBS STATS (CARD DI ATAS GRADIENT) ========== */}
      <section className="relative py-12 md:py-16">
        {/* soft background hijau muda */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
          style={{
            background: "linear-gradient(180deg, #E6FFF3 0%, #D9FBEC 40%, #F6FBF8 100%)",
            backgroundImage: "radial-gradient(#10b981 0.5px, transparent 0.5px), linear-gradient(180deg, #E6FFF3 0%, #D9FBEC 40%, #F6FBF8 100%)",
            backgroundSize: "24px 24px, 100% 100%"
          }}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl bg-white/95 px-6 py-8 md:px-10 md:py-10 shadow-sm ring-1 ring-emerald-100 backdrop-blur"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-emerald-900 text-center">
              <span className="text-emerald-700 font-semibold underline underline-offset-4 decoration-emerald-400/80">
                {t("home.aboutJobs.title.1")}
              </span>{" "}
              <span className="font-bold text-emerald-900">
                {t("home.aboutJobs.title.2")}
              </span>
            </h2>

            <p className="mt-3 text-sm md:text-base text-emerald-800 max-w-2xl mx-auto leading-relaxed text-center">
              {t("home.aboutJobs.desc")}
            </p>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              <StatItem value="52,015" label={t("home.aboutJobs.stats.jobs")} delay={0.1} />
              <StatItem value="24,325" label={t("home.aboutJobs.stats.hires")} delay={0.2} />
              <StatItem value="1,532" label={t("home.aboutJobs.stats.companies")} delay={0.3} />
              <StatItem value="1.2M" label={t("home.aboutJobs.stats.visitors")} delay={0.4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== NEW: HOW IT WORKS ========== */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        {/* Decorative background blob - Animated */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-emerald-50/50 blur-3xl -z-10"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[300px] w-[300px] rounded-full bg-sky-50/50 blur-3xl -z-10"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t("home.howItWorks.title")}
            </h2>
            <p className="mt-2 text-slate-600 leading-relaxed text-sm md:text-base">
              {t("home.howItWorks.desc")}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                step: "01",
                title: t("home.howItWorks.steps.1.title"),
                desc: t("home.howItWorks.steps.1.desc"),
              },
              {
                step: "02",
                title: t("home.howItWorks.steps.2.title"),
                desc: t("home.howItWorks.steps.2.desc"),
              },
              {
                step: "03",
                title: t("home.howItWorks.steps.3.title"),
                desc: t("home.howItWorks.steps.3.desc"),
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative rounded-2xl bg-white px-6 py-7 shadow-sm ring-1 ring-emerald-100 hover:shadow-md transition"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-700">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NEW: SECTORS & ROLES ========== */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-emerald-50/80 via-white to-white relative">
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(0deg, transparent 24%, #e5e7eb 25%, #e5e7eb 26%, transparent 27%, transparent 74%, #e5e7eb 75%, #e5e7eb 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #e5e7eb 25%, #e5e7eb 26%, transparent 27%, transparent 74%, #e5e7eb 75%, #e5e7eb 76%, transparent 77%, transparent)",
            backgroundSize: "60px 60px"
          }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t("home.sectors.title")}
            </h2>
            <p className="mt-2 text-slate-600 leading-relaxed text-sm md:text-base">
              {t("home.sectors.desc")}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              t("home.sectors.items.oilGas"),
              t("home.sectors.items.lng"),
              t("home.sectors.items.power"),
              t("home.sectors.items.renewable"),
              t("home.sectors.items.om"),
              t("home.sectors.items.hse"),
              t("home.sectors.items.project"),
              t("home.sectors.items.engineering"),
            ].map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-center rounded-2xl bg-white px-3 py-3 text-xs md:text-sm font-medium text-emerald-800 shadow-sm ring-1 ring-emerald-100 hover:ring-emerald-300 hover:bg-emerald-50 transition-all cursor-default"
              >
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TEAM SECTION ========== */}
      <section className="relative py-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
          style={{
            background:
              "linear-gradient(180deg, #E6FFF3 0%, #BAF7D3 35%, #F6FBF8 100%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* heading */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-emerald-900">
              {t("home.team.title.1")}{" "}
              <span className="text-emerald-700 underline underline-offset-4 decoration-emerald-400/80">
                {t("home.team.title.2")}
              </span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-emerald-800 leading-relaxed">
              {t("home.team.desc")}
            </p>
          </div>

          {/* images */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <motion.figure
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-emerald-100/80"
            >
              <Image
                src={Team1}
                alt="ArkWork team presenting in the office"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.figure>
            <motion.figure
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-emerald-100/80"
            >
              <Image
                src={Team2}
                alt="ArkWork team collaborating around a whiteboard"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.figure>
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID (tetap) ========== */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-emerald-50 via-sky-50 to-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-50" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent opacity-50" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* heading */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t("home.features.title")}
            </h2>
            <p className="mt-2 text-slate-600 leading-relaxed">
              {t("home.features.desc")}
            </p>
          </div>

          {/* feature cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Feature
              title={t("home.feature.1.title")}
              desc={t("home.feature.1.desc")}
              icon={<SearchSparkIcon className="h-6 w-6 text-emerald-600" />}
              delay={0.1}
            />
            <Feature
              title={t("home.feature.2.title")}
              desc={t("home.feature.2.desc")}
              icon={<FolderIcon className="h-6 w-6 text-sky-600" />}
              delay={0.2}
            />
            <Feature
              title={t("home.feature.3.title")}
              desc={t("home.feature.3.desc")}
              icon={<MatchIcon className="h-6 w-6 text-emerald-500" />}
              delay={0.3}
            />
            <Feature
              title={t("home.feature.4.title")}
              desc={t("home.feature.4.desc")}
              icon={<NewsIcon className="h-6 w-6 text-sky-500" />}
              delay={0.4}
            />
            <Feature
              title={t("home.feature.5.title")}
              desc={t("home.feature.5.desc")}
              icon={<UsersIcon className="h-6 w-6 text-emerald-500" />}
              delay={0.5}
            />
            <Feature
              title={t("home.feature.6.title")}
              desc={t("home.feature.6.desc")}
              icon={<BoltIcon className="h-6 w-6 text-sky-600" />}
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA BOX (tetap) ========== */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-[1px] shadow-2xl shadow-emerald-900/20"
          >
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 px-6 py-10 md:px-12 md:py-16 text-center relative overflow-hidden">
              {/* Decorative patterns */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />

              {/* Animated glow background */}
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] -z-10 rounded-full translate-x-1/3 -translate-y-1/3"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 blur-[80px] -z-10 rounded-full -translate-x-1/3 translate-y-1/3"
              />

              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/50 px-4 py-1.5 text-xs font-medium text-emerald-100 border border-emerald-700/50 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ArkWork · Energy Talent Hub
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                {t("home.final.title")}
              </h3>

              <p className="mt-4 text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
                {t("home.final.desc")}
              </p>

              <div className="mt-8">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-emerald-900 font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-50 transition-colors"
                >
                  {t("home.final.cta")}
                </motion.a>
              </div>

              <p className="mt-6 text-xs text-emerald-400/60 leading-relaxed font-medium">
                {t("home.final.note")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------
   Small reusable components
------------------------------------------------------------------ */

function CardLink({
  href,
  title,
  desc,
  icon,
  chip,
}: {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
  chip?: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm hover:shadow-md hover:border-emerald-300/90 hover:bg-emerald-50/60 transition"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-10 w-10 rounded-xl bg-emerald-50 grid place-items-center group-hover:bg-emerald-100 transition">
          {icon}
        </div>
        <div className="text-left">
          {chip && (
            <div className="mb-1">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                {chip}
              </span>
            </div>
          )}
          <h3 className="font-semibold text-slate-900 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </a>
  );
}

function Feature({
  title,
  desc,
  icon,
  delay = 0,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm hover:shadow-md hover:border-emerald-300/80 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 grid place-items-center">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 leading-tight">
            {title}
          </h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* Stat item component */
function StatItem({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center rounded-xl bg-emerald-50 px-4 py-5 shadow-sm border border-emerald-100"
    >
      <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-800">
        {value}
      </div>
      <div className="mt-1 text-xs md:text-sm text-emerald-700/85">
        {label}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Icons
------------------------------------------------------------------ */

function MagnifierIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PulseIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M3 12h4l2-6 4 12 2-6h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BuildingIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 7h3M8 11h3M8 15h3M13 7h3M13 11h3M13 15h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchSparkIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 4l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" />
    </svg>
  );
}

function FolderIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MatchIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function NewsIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 8h10M7 12h10M7 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 20a5 5 0 017-4.58M14 20a5 5 0 015-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoltIcon(p: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
