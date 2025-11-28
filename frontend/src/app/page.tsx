"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import ArkHero from "@/app/Images/1.jpg";

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* ========== HERO ========== */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Background image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={ArkHero}
            alt="ArkWork Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>

        {/* soft radial glows hijau + biru */}
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(900px 480px at 10% -10%, rgba(16,185,129,0.52), transparent), radial-gradient(800px 420px at 90% 0%, rgba(56,189,248,0.4), transparent)",
          }}
        />

        {/* content */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-18 md:py-24 text-center">
          {/* small badge */}
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-50 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {t("cta.energy")}
            </span>
          </div>

          <h1
            id="hero-title"
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight"
          >
            {t("home.hero.title.1")}{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-100 bg-clip-text text-transparent">
              {t("home.hero.title.2")}
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-slate-100/90 max-w-2xl mx-auto leading-relaxed">
            {t("home.hero.desc")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
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
          </div>
        </div>
      </section>

      {/* ========== EXPLORE WITHOUT SIGN IN ========== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* heading */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t("home.explore.title")}
            </h2>
            <p className="mt-2 text-slate-600 leading-relaxed">
              {t("home.explore.desc")}
            </p>
          </div>

          {/* cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <CardLink
              href="/jobs"
              title={t("home.card.jobs.title")}
              desc={t("home.card.jobs.desc")}
              icon={
                <MagnifierIcon className="h-6 w-6 text-emerald-600" />
              }
              chip={t("jobs.heading")}
            />

            <CardLink
              href="/news"
              title={t("home.card.news.title")}
              desc={t("home.card.news.desc")}
              icon={<PulseIcon className="h-6 w-6 text-sky-600" />}
              chip={t("news.latest")}
            />
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-emerald-50 via-sky-50 to-white">
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
              icon={
                <SearchSparkIcon className="h-6 w-6 text-emerald-600" />
              }
            />
            <Feature
              title={t("home.feature.2.title")}
              desc={t("home.feature.2.desc")}
              icon={<FolderIcon className="h-6 w-6 text-sky-600" />}
            />
            <Feature
              title={t("home.feature.3.title")}
              desc={t("home.feature.3.desc")}
              icon={<MatchIcon className="h-6 w-6 text-emerald-500" />}
            />
            <Feature
              title={t("home.feature.4.title")}
              desc={t("home.feature.4.desc")}
              icon={<NewsIcon className="h-6 w-6 text-sky-500" />}
            />
            <Feature
              title={t("home.feature.5.title")}
              desc={t("home.feature.5.desc")}
              icon={<UsersIcon className="h-6 w-6 text-emerald-500" />}
            />
            <Feature
              title={t("home.feature.6.title")}
              desc={t("home.feature.6.desc")}
              icon={<BoltIcon className="h-6 w-6 text-sky-600" />}
            />
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA BOX ========== */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-emerald-400 p-[1px] shadow-xl shadow-emerald-500/20">
            <div className="rounded-3xl bg-slate-950/95 px-6 py-8 md:px-10 md:py-12 text-center">
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-100 border border-emerald-400/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  ArkWork · Energy Talent Hub
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {t("home.final.title")}
              </h3>

              <p className="mt-3 text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
                {t("home.final.desc")}
              </p>

              <div className="mt-6">
                <a
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-7 py-3 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:translate-y-[1px] transition"
                >
                  {t("home.final.cta")}
                </a>
              </div>

              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                {t("home.final.note")}
              </p>
            </div>
          </div>
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
}: {
  title: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm hover:shadow-md hover:border-emerald-300/80 transition">
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
    </div>
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
