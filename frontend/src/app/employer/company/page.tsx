'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/nav'; 

/* ------------------- CONFIG ------------------- */
// Pastikan ini mengarah ke PORT BACKEND (biasanya 4000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CompanyProfilePage() {
  const router = useRouter();
  
  // State Data Form
  const [form, setForm] = useState({
    name: '',
    email: '', 
    website: '',
    size: '',
    about: '',
    address: '', 
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  /* ------------------- 1. FETCH DATA ------------------- */
  useEffect(() => {
    async function fetchProfile() {
      try {
        // A. Cek LocalStorage DULUAN (Supaya user senang, gambar langsung muncul)
        const savedLogo = localStorage.getItem('demo_company_logo');
        if (savedLogo) {
            setLogoUrl(savedLogo);
        }

        // B. Fetch Data Real dari Server
        const res = await fetch(`${API_BASE}/api/employers/profile`, { credentials: 'include' });
        const json = await res.json();
        
        if (json.ok && json.data) {
          const d = json.data;
          
          setForm({
            name: d.displayName || d.companyName || '',
            email: d.email || '', 
            website: d.website || '',
            size: d.size || d.employeeCount || '',
            about: d.about || d.description || d.bio || '', 
            address: d.hqCity || d.address || '', 
          });
          
          // C. Logika Pintar URL Gambar
          if (d.logoUrl) {
            // Jika URL dari server valid (bukan null)
            let fixedUrl = d.logoUrl;

            // Jika path relatif (misal: /uploads/...), tambahkan API_BASE
            if (d.logoUrl.startsWith('/')) {
                fixedUrl = `${API_BASE}${d.logoUrl}`;
            }

            // Simpan ke state & update localStorage agar sinkron
            setLogoUrl(fixedUrl);
            localStorage.setItem('demo_company_logo', fixedUrl);
          }
        }
      } catch (err) {
        console.error("❌ Error Fetch:", err);
        // Jika error, kita diam saja karena LocalStorage mungkin sudah menolong kita
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Helper untuk update state form
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  /* ------------------- 2. UPLOAD LOGO (LANGSUNG KE SERVER) ------------------- */
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validasi Ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Maksimal ukuran file 2MB"); return;
    }

    // 1. Tampilkan Preview Dulu (UX Cepat)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoUrl(base64String);
      localStorage.setItem('demo_company_logo', base64String); 
    };
    reader.readAsDataURL(file);

    // 2. Upload ke Backend di Background
    setIsUploadingLogo(true);
    try {
        const formData = new FormData();
        formData.append('logo', file); // Pastikan nama field 'logo' sesuai backend (multer)

        const res = await fetch(`${API_BASE}/api/employers/upload-logo`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Penting untuk kirim cookie session
        });

        const json = await res.json();
        if (json.ok && json.logoUrl) {
            console.log("✅ Upload sukses, URL baru:", json.logoUrl);
            // Update state dengan URL final dari server jika perlu
            // (Opsional, karena preview sudah muncul)
        } else {
            console.warn("⚠️ Gagal upload ke server:", json.message);
        }
    } catch (error) {
        console.error("Gagal upload logo:", error);
    } finally {
        setIsUploadingLogo(false);
    }
  };

  /* ------------------- 3. SUBMIT FORM TEXT ------------------- */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        displayName: form.name,
        website: form.website,
        size: form.size,
        about: form.about,
        hqCity: form.address,
      };

      const res = await fetch(`${API_BASE}/api/employers/update-basic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.ok) {
          alert("✅ Profil berhasil disimpan!");
          // Refresh data agar sinkron
          router.refresh(); 
      }
      else alert("⚠️ Gagal simpan: " + (json.message || "Error server"));

    } catch (err) {
      console.error(err);
      alert("Offline / Error Koneksi");
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Profil...</div>;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-slate-50 pb-20 font-sans">
        <div className="mx-auto max-w-5xl px-4 py-8">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-950">Profil Perusahaan</h1>
            <p className="text-slate-500">Lengkapi informasi perusahaan Anda agar terlihat lebih profesional.</p>
          </div>

          {/* Card Utama */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
            
            {/* === SECTION 1: LOGO === */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Logo Perusahaan</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Preview Kotak */}
                    <div className="relative w-32 h-32 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                className="w-full h-full object-cover" 
                                alt="Logo Perusahaan"
                                onError={(e) => {
                                    // Fallback jika gambar broken
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-emerald-50');
                                }} 
                            />
                        ) : (
                            <span className="text-xs text-slate-400">No Logo</span>
                        )}
                        
                        {/* Loading Overlay saat upload */}
                        {isUploadingLogo && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Area Upload Dashed */}
                    <div className="flex-1 w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-100 border-dashed rounded-lg cursor-pointer bg-emerald-50/30 hover:bg-emerald-50 transition-colors relative group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <p className="text-sm font-semibold text-emerald-600 mb-1">
                                    {isUploadingLogo ? 'Mengunggah...' : 'Klik untuk Unggah Logo'}
                                </p>
                                <p className="text-xs text-slate-500">PNG/JPG, rasio 1:1, max 2MB.</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                        </label>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* === SECTION 2: FORM TEXT === */}
            <form onSubmit={onSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Informasi Utama</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Nama Perusahaan</label>
                        <input 
                            value={form.name} onChange={e => set('name', e.target.value)}
                            className="w-full rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 border" 
                            required
                        />
                    </div>
                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Email (Admin)</label>
                        <input 
                            value={form.email} disabled
                            className="w-full rounded-lg border-slate-200 bg-slate-100 text-slate-500 py-2.5 px-3 text-sm cursor-not-allowed border" 
                        />
                    </div>
                </div>

                {/* Website */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Website</label>
                    <input 
                        value={form.website} onChange={e => set('website', e.target.value)}
                        placeholder="https://perusahaan.com"
                        className="w-full rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 border" 
                    />
                </div>

                {/* Tentang */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Tentang Perusahaan</label>
                    <textarea 
                        rows={4}
                        value={form.about} onChange={e => set('about', e.target.value)}
                        placeholder="Deskripsikan perusahaan Anda..."
                        className="w-full rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 resize-none border" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Ukuran Perusahaan</label>
                        <select 
                            value={form.size} onChange={e => set('size', e.target.value)}
                            className="w-full rounded-lg border-slate-300 py-2.5 px-3 text-sm bg-white border"
                        >
                             <option value="">Pilih Ukuran</option>
                             <option value="1-10">1-10 Karyawan</option>
                             <option value="11-50">11-50 Karyawan</option>
                             <option value="51-200">51-200 Karyawan</option>
                             <option value="500+">500+ Karyawan</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Kota / Alamat</label>
                        <input 
                            value={form.address} onChange={e => set('address', e.target.value)}
                            className="w-full rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 border" 
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm">
                        Simpan Perubahan
                    </button>
                </div>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}