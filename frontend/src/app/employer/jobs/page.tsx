"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/nav";
import Footer from "@/components/Footer";

/* ---------------- Config ---------------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";
const API = {
  LIST: () => `${API_BASE}/api/employer-jobs`,
  TOGGLE: (id: string | number) => `${API_BASE}/api/employer-jobs/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/api/employer-jobs/${id}`, // soft delete
  // Optional helper (backend sudah best-effort hapus reports saat delete):
  // DELETE_REPORTS_BY_JOB: (id: string | number) => `${API_BASE}/api/admin/reports/by-job/${id}`,
};

/* ---------------- Types ---------------- */
type LocalJob = {
  id: number | string;
  title: string;
  company: string;
  location: string;
  type: "full_time" | "part_time" | "contract" | "internship";
  remote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  deadline?: string | null;
  tags?: string[];
  description?: string;
  requirements?: string;
  postedAt?: string; // ISO
  status?: "active" | "closed";
  logo?: string | null; // dataURL/logo url (opsional)
};

type JobDTO = {
  id: string;
  title: string;
  location: string | null;
  employment: string | null; // ex: "full_time" | "part_time" | "contract" | "internship"
  description: string | null;
  postedAt: string; // ISO
  company: string; // employer.displayName
  logoUrl: string | null;
  isActive: boolean | null;
  isDraft?: boolean | null;
};

/* ---------------- UI: Modern Alerts ---------------- */
function AlertModal({
  title = "Berhasil",
  message,
  variant = "success",
  onClose,
}: {
  title?: string;
  message: string;
  variant?: "success" | "error" | "info";
  onClose: () => void;
}) {
  const ring =
    variant === "success"
      ? "bg-emerald-100 text-emerald-600"
      : variant === "error"
        ? "bg-rose-100 text-rose-600"
        : "bg-blue-100 text-blue-600";

  const icon = (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {variant === "success" && (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      )}
      {variant === "error" && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      )}
      {variant === "info" && (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01"
          />
          <circle cx="12" cy="12" r="9" />
        </>
      )}
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${ring}`}
          >
            {icon}
          </div>
        </div>
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Oke
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title = "Konfirmasi",
  message,
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.29 3.86l-7.4 12.84A2 2 0 004.53 20h14.94a2 2 0 001.64-3.3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={onCancel}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function initials(name: string) {
  const parts = name?.trim().split(/\s+/) ?? [];
  if (parts.length === 0) return "AW";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function mapDTOToLocal(x: JobDTO): LocalJob {
  // employment -> union LocalJob.type (fallback full_time)
  const emp = (x.employment || "full_time").toLowerCase();
  const employment =
    emp === "full_time" ||
    emp === "part_time" ||
    emp === "contract" ||
    emp === "internship"
      ? (emp as LocalJob["type"])
      : "full_time";

  return {
    id: x.id,
    title: x.title,
    company: x.company || "Company",
    location: x.location || "",
    type: employment,
    description: x.description || "",
    postedAt: x.postedAt,
    status: x.isActive === false ? "closed" : "active",
    logo: x.logoUrl || null,
  };
}

/* ---------------- Page ---------------- */
export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<LocalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LocalJob | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function fetchJSON<T>(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<T> {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // load awal
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await fetchJSON<{ ok: boolean; data: JobDTO[] }>(
          API.LIST(),
        );
        const arr = (data?.data || []).map(mapDTOToLocal);
        setJobs(arr);
      } catch (e: any) {
        setErrorMsg(e?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function reload(message?: string) {
    try {
      const data = await fetchJSON<{ ok: boolean; data: JobDTO[] }>(API.LIST());
      setJobs((data?.data || []).map(mapDTOToLocal));
      if (message) setAlertMsg(message);
    } catch (e: any) {
      setErrorMsg(e?.message || "Gagal memuat ulang data");
    }
  }

  async function remove(id: LocalJob["id"]) {
    setConfirmDelete(null);
    try {
      await fetchJSON<{ ok: boolean }>(API.DELETE(id), { method: "DELETE" });
      // Optional: backend sudah best-effort hapus reports saat delete
      // await fetchJSON<{ ok: boolean }>(API.DELETE_REPORTS_BY_JOB(id), { method: "DELETE" });

      await reload("Job berhasil dihapus.");
    } catch (e: any) {
      setErrorMsg(e?.message || "Gagal menghapus job");
    }
  }

  async function toggleStatus(id: LocalJob["id"]) {
    // cari current status
    const current = jobs.find((j) => String(j.id) === String(id));
    const nextStatus =
      (current?.status ?? "active") === "active" ? "INACTIVE" : "ACTIVE";
    try {
      await fetchJSON<{ ok: boolean }>(API.TOGGLE(id), {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await reload("Status berhasil diperbarui.");
    } catch (e: any) {
      setErrorMsg(e?.message || "Gagal mengubah status");
    }
  }

  // Hapus semua data (best-effort, paralel)
  async function resetAll() {
    setConfirmReset(false);
    try {
      const ids = jobs.map((j) => j.id);
      await Promise.allSettled(
        ids.map((id) => fetchJSON(API.DELETE(id), { method: "DELETE" })),
      );
      await reload("Semua lowongan berhasil dihapus.");
    } catch (e: any) {
      setErrorMsg(e?.message || "Gagal menghapus semua lowongan");
    }
  }

  const sorted = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const ta = new Date(a.postedAt ?? 0).getTime();
        const tb = new Date(b.postedAt ?? 0).getTime();
        return tb - ta;
      }),
    [jobs],
  );

  return (
    <>
      <Nav />
      <main className="min-h-[60vh] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
              <p className="text-sm text-slate-600">
                Kelola lowongan yang sedang tayang.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/employer/jobs/new"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Post a Job
              </Link>
              <button
                onClick={() => setConfirmReset(true)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                title="Hapus semua data di server (soft delete masing-masing)"
                disabled={loading || jobs.length === 0}
              >
                Hapus Semua
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Posisi</th>
                  <th className="px-4 py-3">Perusahaan</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Diposting</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-600"
                    >
                      Memuat data…
                    </td>
                  </tr>
                )}

                {!loading && sorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-600"
                    >
                      Belum ada lowongan. Klik{" "}
                      <span className="font-medium text-slate-900">
                        Post a Job
                      </span>
                      .
                    </td>
                  </tr>
                )}

                {!loading &&
                  sorted.map((j) => {
                    const friendlyType =
                      j.type === "full_time"
                        ? "Full-time"
                        : j.type === "part_time"
                          ? "Part-time"
                          : j.type === "contract"
                            ? "Contract"
                            : "Internship";

                    return (
                      <tr key={j.id} className="border-b last:border-0">
                        {/* Title + avatar/logo */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-400 text-sm font-bold text-white">
                              {j.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={j.logo}
                                  alt="logo"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initials(j.company || "AW")
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {j.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {j.tags?.slice(0, 3).join(" • ")}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3 text-slate-700">
                          {j.company}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 text-slate-700">
                          {j.location} {j.remote ? "• Remote" : ""}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-slate-700">
                          {friendlyType}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                              (j.status ?? "active") === "active"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                                : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
                            ].join(" ")}
                          >
                            {(j.status ?? "active") === "active"
                              ? "Active"
                              : "Closed"}
                          </span>
                        </td>

                        {/* Posted date */}
                        <td className="px-4 py-3 text-slate-700">
                          {j.postedAt
                            ? new Date(j.postedAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/employer/jobs/new?id=${j.id}`}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => toggleStatus(j.id)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                              disabled={loading}
                            >
                              {(j.status ?? "active") === "active"
                                ? "Tutup"
                                : "Buka"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(j)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                              disabled={loading}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Errors */}
        {errorMsg && (
          <AlertModal
            title="Gagal"
            message={errorMsg}
            variant="error"
            onClose={() => setErrorMsg(null)}
          />
        )}

        {/* Alert success */}
        {alertMsg && (
          <AlertModal
            title="Berhasil"
            message={alertMsg}
            variant="success"
            onClose={() => setAlertMsg(null)}
          />
        )}

        {/* Confirm delete (single) */}
        {confirmDelete && (
          <ConfirmModal
            title="Hapus Lowongan?"
            message={`Anda yakin ingin menghapus "${confirmDelete.title}" di ${confirmDelete.company}? Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Ya, hapus"
            cancelText="Batal"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => remove(confirmDelete.id)}
          />
        )}

        {/* Confirm reset (all) */}
        {confirmReset && (
          <ConfirmModal
            title="Hapus Semua Lowongan?"
            message="Ini akan menghapus semua lowongan di server (soft delete). Lanjutkan?"
            confirmText="Ya, hapus semua"
            cancelText="Batal"
            onCancel={() => setConfirmReset(false)}
            onConfirm={resetAll}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
