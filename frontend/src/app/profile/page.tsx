"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// URL Backend (Sesuaikan port backend Anda)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/* =========================================================
   GREEN THEME TOKENS
========================================================= */
const GREEN = {
    pageBg: "bg-gradient-to-b from-green-50 via-emerald-50 to-white",
    cardBg: "bg-white",
    cardBorder: "border-emerald-200/70",
    cardShadow: "shadow-sm shadow-emerald-900/5",

    textTitle: "text-emerald-950",
    textBody: "text-emerald-900/80",
    textMuted: "text-emerald-900/60",

    inputBorder: "border-emerald-200",
    inputFocus: "focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200",

    btnPrimary: "bg-emerald-700 hover:bg-emerald-800 text-white",
    btnOutline: "border-emerald-300 text-emerald-900 hover:bg-emerald-50",
    btnDangerLink: "text-red-600 hover:underline",
};

/** ================== 1. UI HELPERS ================== */
function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className={`mb-1.5 block text-sm font-medium ${GREEN.textTitle}`}>
            {children}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return (
        <input
            {...rest}
            className={[
                "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-emerald-950 placeholder-emerald-900/35 outline-none transition",
                GREEN.inputBorder,
                GREEN.inputFocus,
                className ?? "",
            ].join(" ")}
        />
    );
}

type Toast = { type: "success" | "error" | "info"; message: string } | null;

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    if (!toast) return null;

    const style =
        toast.type === "success"
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : toast.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-200";

    return (
        <div
            className={`fixed top-4 right-4 z-50 rounded-2xl border px-4 py-3 text-sm shadow-lg ${style}`}
        >
            <div className="flex items-start justify-between gap-3">
                <span>{toast.message}</span>
                <button
                    onClick={onClose}
                    className="font-bold opacity-70 hover:opacity-100"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

/** ================== 2. LOGIKA DROPDOWN WILAYAH ================== */
type Opt = { id: string; name: string };

function WilayahSelect({
    value,
    onChange,
    labelProv = "Provinsi",
    labelKab = "Kabupaten/Kota",
    labelKec = "Kecamatan",
}: {
    value: string;
    onChange: (v: string) => void;
    labelProv?: string;
    labelKab?: string;
    labelKec?: string;
}) {
    const [provinces, setProvinces] = useState<Opt[]>([]);
    const [regencies, setRegencies] = useState<Opt[]>([]);
    const [districts, setDistricts] = useState<Opt[]>([]);

    const [prov, setProv] = useState<Opt | null>(null);
    const [kab, setKab] = useState<Opt | null>(null);
    const [kec, setKec] = useState<Opt | null>(null);

    // 1. Fetch Provinsi
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(
                    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
                );
                const data = await r.json();
                const items = (data || []).map((d: any) => ({
                    id: String(d.id),
                    name: d.name,
                }));
                setProvinces(items);
            } catch {
                setProvinces([]);
            }
        })();
    }, []);

    // 2. Fetch Kabupaten
    useEffect(() => {
        if (!prov) {
            setRegencies([]);
            setKab(null);
            setDistricts([]);
            setKec(null);
            return;
        }
        (async () => {
            try {
                const r = await fetch(
                    `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`
                );
                const data = await r.json();
                const items = (data || []).map((d: any) => ({
                    id: String(d.id),
                    name: d.name,
                }));
                setRegencies(items);
                setKab(null);
                setDistricts([]);
                setKec(null);
            } catch {
                setRegencies([]);
            }
        })();
    }, [prov?.id]);

    // 3. Fetch Kecamatan
    useEffect(() => {
        if (!kab) {
            setDistricts([]);
            setKec(null);
            return;
        }
        (async () => {
            try {
                const r = await fetch(
                    `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kab.id}.json`
                );
                const data = await r.json();
                const items = (data || []).map((d: any) => ({
                    id: String(d.id),
                    name: d.name,
                }));
                setDistricts(items);
                setKec(null);
            } catch {
                setDistricts([]);
                setKec(null);
            }
        })();
    }, [kab?.id]);

    // Gabungkan label lokasi saat dropdown berubah
    useEffect(() => {
        if (prov || kab || kec) {
            const parts = [kec?.name, kab?.name, prov?.name].filter(Boolean);
            if (parts.length > 0) onChange(parts.join(", "));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prov, kab, kec]);

    const Select = ({
        value,
        setValue,
        options,
        placeholder,
        disabled,
    }: {
        value: Opt | null;
        setValue: (o: Opt | null) => void;
        options: Opt[];
        placeholder: string;
        disabled?: boolean;
    }) => (
        <div className="relative">
            <select
                value={value?.id || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    const o = options.find((x) => x.id === val) || null;
                    setValue(o);
                }}
                disabled={disabled}
                className={[
                    "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition",
                    GREEN.inputBorder,
                    GREEN.inputFocus,
                    disabled ? "bg-emerald-50 text-emerald-900/60" : "text-emerald-950",
                ].join(" ")}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.name}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/50">
                ▾
            </span>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <span className={`mb-1 block text-sm ${GREEN.textBody}`}>{labelProv}</span>
                    <Select
                        value={prov}
                        setValue={setProv}
                        options={provinces}
                        placeholder="Pilih provinsi…"
                    />
                </div>
                <div>
                    <span className={`mb-1 block text-sm ${GREEN.textBody}`}>{labelKab}</span>
                    <Select
                        value={kab}
                        setValue={setKab}
                        options={regencies}
                        placeholder="Pilih kab/kota…"
                        disabled={!prov}
                    />
                </div>
                <div>
                    <span className={`mb-1 block text-sm ${GREEN.textBody}`}>{labelKec}</span>
                    <Select
                        value={kec}
                        setValue={setKec}
                        options={districts}
                        placeholder="Pilih kecamatan…"
                        disabled={!kab}
                    />
                </div>
            </div>

            {/* Lokasi terpilih */}
            <div className={`rounded-xl border p-3 text-sm flex justify-between items-center bg-emerald-50 ${GREEN.cardBorder}`}>
                <span className={GREEN.textBody}>
                    Lokasi saat ini:{" "}
                    <span className={`font-semibold ${GREEN.textTitle}`}>{value || "-"}</span>
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            setProv(null);
                            setKab(null);
                            setKec(null);
                            onChange("");
                        }}
                        className={GREEN.btnDangerLink}
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}

/** ================== 3. HALAMAN PROFIL UTAMA ================== */
export default function ProfilePage() {
    const t = useTranslations("profile");
    const { user } = useAuth(); // Auth Context
    const router = useRouter();

    // State Form Data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [skills, setSkills] = useState(""); // Add skills state

    // State Avatar
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // State UI
    const [loading, setLoading] = useState(true);
    const [busySave, setBusySave] = useState(false);
    const [busyUpload, setBusyUpload] = useState(false);
    const [toast, setToast] = useState<Toast>(null);

    // --- A. LOAD DATA DARI BACKEND ---
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${API_URL}/api/profile`, {
                    credentials: "include",
                });
                const json = await res.json();

                if (json.ok && json.data) {
                    const d = json.data;
                    setName(d.name || "");
                    setEmail(d.email || "");
                    setLocation(d.location || "");
                    setPhone(d.phone || "");
                    setSkills(d.skills || ""); // Set skills from API

                    if (d.photoUrl) {
                        const fullUrl = d.photoUrl.startsWith("http")
                            ? d.photoUrl
                            : `${API_URL}${d.photoUrl}`;
                        setAvatarUrl(fullUrl);
                    }
                }
            } catch (e) {
                console.error("Gagal load profile", e);
                setToast({ type: "error", message: "Gagal memuat data profil" });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // --- B. SIMPAN DATA KE BACKEND (PUT) ---
    async function save() {
        setBusySave(true);
        try {
            const payload = { name, location, phone, skills }; // Include skills in payload

            const res = await fetch(`${API_URL}/api/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal menyimpan");

            setToast({ type: "success", message: "Profil berhasil disimpan!" });
        } catch (err) {
            setToast({ type: "error", message: "Gagal menyimpan data." });
        } finally {
            setBusySave(false);
        }
    }

    // --- C. UPLOAD AVATAR (POST FormData) ---
    async function onPickAvatar(file: File) {
        if (!file.type.startsWith("image/")) {
            setToast({ type: "error", message: "File harus gambar" });
            return;
        }
        setBusyUpload(true);
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await fetch(`${API_URL}/api/profile/avatar`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const json = await res.json();

            if (json.ok) {
                setAvatarUrl(`${API_URL}${json.url}`);
                setToast({ type: "success", message: "Foto diperbarui!" });
                window.dispatchEvent(new Event("ark:avatar-updated")); // Update Navbar
            } else {
                throw new Error(json.error);
            }
        } catch (err) {
            setToast({ type: "error", message: "Gagal upload foto." });
        } finally {
            setBusyUpload(false);
        }
    }

    if (loading)
        return (
            <div className="p-10 text-center text-emerald-900/70">
                Sedang memuat profil...
            </div>
        );

    return (
        <div className={`min-h-screen ${GREEN.pageBg} py-10`}>
            <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className={`text-2xl font-semibold tracking-tight ${GREEN.textTitle}`}>
                        {t("title") || "Profil Saya"}
                    </h1>
                    <button
                        onClick={save}
                        disabled={busySave}
                        className={[
                            "rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition disabled:opacity-60",
                            GREEN.btnPrimary,
                        ].join(" ")}
                    >
                        {busySave ? "Menyimpan..." : "Simpan Profil"}
                    </button>
                </div>

                <ToastBanner toast={toast} onClose={() => setToast(null)} />

                {/* Main Card */}
                <div className={`rounded-2xl border p-6 ${GREEN.cardBorder} ${GREEN.cardBg} ${GREEN.cardShadow}`}>
                    {/* Avatar Section */}
                    <div className="mb-8 flex items-center gap-5 border-b border-emerald-100 pb-8">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-emerald-200 bg-emerald-50">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-400">
                                    {(name?.[0] || email?.[0] || "U").toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className={`font-medium ${GREEN.textTitle}`}>Foto Profil</h3>
                            <p className={`mb-3 text-sm ${GREEN.textMuted}`}>
                                Disarankan rasio 1:1 (Max 2MB)
                            </p>
                            <label
                                className={[
                                    "inline-flex cursor-pointer items-center rounded-lg px-3 py-1.5 text-xs font-medium transition",
                                    GREEN.btnPrimary,
                                ].join(" ")}
                            >
                                {busyUpload ? "Mengunggah..." : "Ganti Foto"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) onPickAvatar(f);
                                    }}
                                    disabled={busyUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label>Nama Lengkap</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama lengkap"
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                value={email}
                                readOnly
                                disabled
                                className="bg-emerald-50 text-emerald-900/60 cursor-not-allowed"
                            />
                        </div>

                        {/* Lokasi */}
                        <div className="md:col-span-2">
                            <Label>Lokasi Domisili</Label>
                            <WilayahSelect value={location} onChange={setLocation} />
                        </div>

                        <div>
                            <Label>Nomor HP</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Contoh: 0812xxxx"
                                type="tel"
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="md:col-span-2">
                        <Label>Keahlian (Skills)</Label>
                        <Input
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="Contoh: React, Node.js, Project Management (pisahkan dengan koma)"
                        />
                        <p className={`mt-1 text-xs ${GREEN.textMuted}`}>
                            Masukkan minimal 3 keahlian untuk meningkatkan skor profil.
                        </p>
                    </div>
                </div>

                {/* Optional footer actions (outline) */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push("/")}
                        className={[
                            "rounded-xl border px-4 py-2 text-sm font-medium transition",
                            GREEN.btnOutline,
                        ].join(" ")}
                        type="button"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}
