"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Logo from "@/app/Images/arkwork-new.png";

export default function Footer() {
  const t = useTranslations();
  const pathname = usePathname();

  // sembunyikan footer jika ada segmen "admin"
  const hideOnThisPage = useMemo(() => {
    if (!pathname) return false;
    const segs = pathname
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean);
    return segs.includes("admin");
  }, [pathname]);

  if (hideOnThisPage) return null;

  const year = new Date().getFullYear();
  const linkCls =
    "text-sm text-neutral-600 hover:text-[#065F2A] dark:text-neutral-400 dark:hover:text-[#A5F3FC] transition-colors";

  return (
    <footer className="mt-16 border-t border-[#16A34A]/30 bg-gradient-to-b from-[#F0FDF4] via-white to-[#EFF6FF] backdrop-blur dark:from-[#020617] dark:via-[#020617] dark:to-[#0B1120] dark:border-[#16A34A]/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Top (layout & ukuran sama, hanya warna dan logo diupdate) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-[#16A34A]/15 dark:bg-white/5 dark:ring-[#16A34A]/40">
                <Image
                  src={Logo}
                  alt={t("footer.logoAlt")}
                  className="h-24 w-auto sm:h-24 md:h-24"
                  priority
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              {t("footer.description")}
            </p>

            {/* Social */}
            <div className="mt-4 flex items-center gap-3">
              {/* LinkedIn */}
              <Social
                href="https://www.linkedin.com/company/hempart-indonesia-official1/posts/?feedView=all"
                label={t("footer.social.linkedin")}
                className="border-[#0A66C2]/60 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white dark:border-[#0A66C2]/80"
              >
                <path d="M4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 8h2v13H3V8Zm5 0h2v2h.03c.28-.53 1.02-1.09 2.1-1.09C14.76 8.91 16 10 16 12.33V21h-2v-7.3c0-1.37-.49-2.3-1.71-2.3-.93 0-1.49.63-1.73 1.24-.09.2-.11.48-.11.76V21H8V8Z" />
              </Social>

              {/* Instagram */}
              <Social
                href="https://www.instagram.com/hempart.indonesia"
                label={t("footer.social.instagram")}
                className="border-[#F97316]/60 text-[#EA580C] hover:bg-gradient-to-tr hover:from-[#F97316] hover:via-[#DB2777] hover:to-[#0EA5E9] hover:text-white dark:border-[#FDBA74]/80"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  ry="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="17" cy="7" r="1.2" />
              </Social>

              {/* Email */}
              <Social
                href="mailto:info@hempartindonesia.com"
                label={t("footer.social.email")}
                className="border-[#16A34A]/60 text-[#166534] hover:bg-[#16A34A] hover:text-white dark:border-[#16A34A]/80"
              >
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2Zm8 7L4.5 6.5h15L12 11Z" />
              </Social>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("footer.headings.product")}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/jobs" className={linkCls}>
                  {t("footer.links.jobs")}
                </Link>
              </li>
              <li>
                <Link href="/tender" className={linkCls}>
                  {t("footer.links.tenders")}
                </Link>
              </li>
              <li>
                <Link href="/news" className={linkCls}>
                  {t("footer.links.news")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("footer.headings.company")}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className={linkCls}>
                  {t("footer.links.home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkCls}>
                  {t("footer.links.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("footer.headings.legal")}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/terms" className={linkCls}>
                  {t("footer.links.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkCls}>
                  {t("footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={linkCls}>
                  {t("footer.links.cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom (layout sama, warna pakai palette baru) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-neutral-200/70 pt-5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 md:flex-row">
          <p className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
            <span>{t("footer.copyright", { year })}</span>
          </p>
          <p className="rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-medium text-[#C2410C] opacity-90 dark:bg-[#431407] dark:text-[#fed7aa]">
            🧡 {t("footer.madeFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className={[
        "grid h-9 w-9 place-items-center rounded-xl border bg-white/90 text-neutral-700 shadow-sm transition-all duration-150 hover:shadow-md hover:scale-[1.05] active:scale-[0.97] dark:bg-white/5 dark:text-neutral-200",
        className ?? "",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden
      >
        {children}
      </svg>
    </a>
  );
}
