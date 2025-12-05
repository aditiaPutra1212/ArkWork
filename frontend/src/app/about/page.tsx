'use client';

import Link from 'next/link';
import Image from 'next/image';
import ArkHero from '@/app/Images/3.jpg';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6FBF8]">
      {/* ====== GLOBAL BACKGROUND DECORATION (GRID + BLUR) ====== */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* top blur */}
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[380px] w-[380px] rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      {/* ====== HEADER DENGAN BACKGROUND GAMBAR ====== */}
      <section className="relative isolate overflow-hidden border-b border-emerald-100">
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6FBF8] via-[#F6FBF8]/92 to-emerald-900/20" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
            TENTANG KAMI
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl md:text-4xl xl:text-5xl font-semibold tracking-tight text-slate-900">
            Membantu Talenta & Perusahaan Energi
            <span className="block mt-2">
              Bertemu dalam Satu Ekosistem Profesional
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700">
            ArkWork adalah platform industri energi yang dirancang untuk
            menghubungkan talenta berkualitas, perusahaan terpercaya, tender,
            dan wawasan industri secara profesional dan berkelanjutan.
          </p>
        </div>
      </section>

      {/* ====== CONTENT ====== */}
      <main className="relative mx-auto max-w-6xl px-6 py-16 space-y-20">
        {/* ====== VISION & MISSION ====== */}
        <section className="grid gap-10 md:grid-cols-2">
          {/* VISION */}
          <div className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-100">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
              Visi Kami
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Menjadi platform utama ekosistem karier dan bisnis energi.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Kami berfokus menciptakan lingkungan kolaboratif yang mempertemukan
              talenta profesional dengan perusahaan dan peluang strategis,
              mendorong pertumbuhan industri energi yang berintegritas.
            </p>
          </div>

          {/* MISSION */}
          <div className="rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-emerald-100">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
              Misi Kami
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
              <li>• Menyediakan akses terpercaya ke lowongan dan tender energi</li>
              <li>• Membantu perusahaan menemukan talenta secara efisien</li>
              <li>• Menyajikan informasi industri yang relevan dan kredibel</li>
              <li>• Mendukung kolaborasi jangka panjang dalam sektor energi</li>
            </ul>
          </div>
        </section>

        {/* ====== CORE VALUES ====== */}
        <section>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900">
              Nilai Inti ArkWork
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-700">
              Prinsip yang menjadi fondasi bagaimana kami membangun produk,
              layanan, dan relasi jangka panjang.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Integritas',
                desc: 'Menjunjung transparansi dan kepercayaan dalam setiap proses.',
              },
              {
                title: 'Inovasi',
                desc: 'Terus mengembangkan solusi yang relevan dan adaptif.',
              },
              {
                title: 'Kolaborasi',
                desc: 'Mewadahi sinergi antara talenta, perusahaan, dan mitra.',
              },
              {
                title: 'Kualitas',
                desc: 'Berkomitmen pada standar layanan dan hasil terbaik.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-emerald-100 hover:shadow-md transition"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ====== CTA ====== */}
        <section>
          <div className="relative overflow-hidden rounded-3xl bg-emerald-900 px-10 py-14 text-white shadow-xl">
            {/* decoration */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-widest uppercase text-emerald-200">
                  Bergabung dengan ArkWork
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight">
                  Bangun Masa Depan Karier & Bisnis Energi
                </h2>
                <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
                  Temukan peluang terbaik atau rekrut talenta profesional melalui
                  platform yang dirancang khusus untuk industri energi.
                </p>
              </div>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-md hover:bg-emerald-50 transition"
              >
                Jelajahi Peluang
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
