// src/app/cv/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/* =========================================================
   Types & Const
========================================================= */
type MonthKey =
    | 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'Mei' | 'Jun' | 'Jul' | 'Agu' | 'Sep' | 'Okt' | 'Nov' | 'Des';

const MONTHS: { key: MonthKey; label: string }[] = [
    { key: 'Jan', label: 'Januari' },
    { key: 'Feb', label: 'Februari' },
    { key: 'Mar', label: 'Maret' },
    { key: 'Apr', label: 'April' },
    { key: 'Mei', label: 'Mei' },
    { key: 'Jun', label: 'Juni' },
    { key: 'Jul', label: 'Juli' },
    { key: 'Agu', label: 'Agustus' },
    { key: 'Sep', label: 'September' },
    { key: 'Okt', label: 'Oktober' },
    { key: 'Nov', label: 'November' },
    { key: 'Des', label: 'Desember' },
];

type ExpItem = {
    id: string;
    title: string;
    org?: string;
    tag?: string;
    startMonth?: MonthKey;
    startYear?: number;
    endMonth?: MonthKey;
    endYear?: number;
    present?: boolean;
    bullets?: string; // one per line
};

type EduItem = {
    id: string;
    school: string;
    degree?: string;
    gpa?: string;
    startYear?: number;
    endYear?: number;
    present?: boolean;
};

type CvDraft = {
    name: string;
    email: string;
    location?: string;
    phone?: string;
    about?: string;

    experiences: ExpItem[];
    educations: EduItem[];

    hardSkillsCsv?: string;
    softSkillsCsv?: string;

    // legacy fallback
    skills?: string[];
};

const LS_DRAFTS_KEY = 'ark_cv_drafts_struct_v2';
const LS_PROFILE_KEY = 'ark_users';

/** Oil & Gas skill suggestions */
const OG_HARD_SKILLS = [
    'Reservoir Engineering', 'Drilling Engineer', 'Completion Engineer', 'Well Intervention / Workover',
    'Production Engineer', 'Process Engineer (Upstream)', 'Process Engineer (Downstream)', 'Piping Engineer',
    'Pipeline Engineer', 'Mechanical (Static)', 'Mechanical (Rotating)', 'Electrical Engineer',
    'Instrumentation & Control', 'Automation / DCS / PLC', 'HSE / HSEQ', 'QA/QC', 'Construction',
    'Pre-commissioning / Commissioning', 'Operations', 'Maintenance', 'Reliability', 'Subsea',
    'Offshore', 'Onshore', 'Flow Assurance', 'SURF', 'FPSO', 'LNG', 'Gas Processing', 'Refinery',
    'Petrochemical', 'Corrosion / Cathodic Protection', 'Welding / NDT', 'Fabrication', 'Marine',
    'Procurement', 'Contracts', 'Supply Chain / Logistics', 'Planning / Scheduling (Primavera P6)',
    'Cost Control', 'Document Control', 'Project Management'
];

const OG_SOFT_SKILLS = [
    'Safety Mindset (HSE)', 'Teamwork (Offshore/Onshore)', 'Communication', 'Leadership',
    'Problem Solving', 'Decision Making', 'Risk Assessment', 'Time Management',
    'Adaptability (Remote/Shift)', 'Stakeholder Management'
];

/* =========================================================
   Green Theme Tokens (Tailwind classes)
========================================================= */
const GREEN = {
    pageBg: 'bg-gradient-to-b from-green-50 via-emerald-50 to-white',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-200/70',
    shadow: 'shadow-sm shadow-emerald-900/5',

    textTitle: 'text-emerald-950',
    textBody: 'text-emerald-900/80',
    textMuted: 'text-emerald-900/60',

    inputBorder: 'border-emerald-200',
    inputFocus: 'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200',

    btnPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    btnPrimarySoft: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnOutline: 'border-emerald-300 text-emerald-900 hover:bg-emerald-50',
    btnGhost: 'text-emerald-800 hover:bg-emerald-50',

    chip: 'border-emerald-200 text-emerald-900 hover:bg-emerald-50',
    dangerOutline: 'border-red-300 text-red-700 hover:bg-red-50',

    sectionLine: 'border-emerald-200',
};

/* =========================================================
   Small UI helpers
========================================================= */
function Label({ children }: { children: React.ReactNode }) {
    return <label className={`mb-1.5 block text-sm font-medium ${GREEN.textTitle}`}>{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return (
        <input
            {...rest}
            className={[
                'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-emerald-950 placeholder-emerald-900/35 outline-none transition',
                GREEN.inputBorder,
                GREEN.inputFocus,
                className || '',
            ].join(' ')}
        />
    );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    const { className, children, ...rest } = props;
    return (
        <select
            {...rest}
            className={[
                'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-8 text-sm text-emerald-950 outline-none transition',
                GREEN.inputBorder,
                GREEN.inputFocus,
                className || '',
            ].join(' ')}
        >
            {children}
        </select>
    );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const { className, ...rest } = props;
    return (
        <textarea
            {...rest}
            className={[
                'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-emerald-950 placeholder-emerald-900/35 outline-none transition',
                GREEN.inputBorder,
                GREEN.inputFocus,
                className || '',
            ].join(' ')}
        />
    );
}

type Toast = { type: 'success' | 'error' | 'info'; message: string } | null;

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    if (!toast) return null;

    const style =
        toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200';

    return (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${style}`}>
            <div className="flex items-start justify-between gap-3">
                <span>{toast.message}</span>
                <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}

/* =========================================================
   Helpers
========================================================= */
function safeUUID() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return Math.random().toString(36).slice(2);
}

function rangeToText(
    startMonth?: MonthKey, startYear?: number,
    endMonth?: MonthKey, endYear?: number, present?: boolean
) {
    const sm = startMonth ? MONTHS.find(m => m.key === startMonth)?.label : '';
    const em = endMonth ? MONTHS.find(m => m.key === endMonth)?.label : '';
    const s = [sm, startYear || ''].filter(Boolean).join(' ');
    const e = present ? 'Sekarang' : [em, endYear || ''].filter(Boolean).join(' ');
    if (!s && !e) return '';
    if (s && !e) return s;
    if (!s && e) return e;
    return `${s}–${e}`;
}

/* =========================================================
   Experience Editor
========================================================= */
function ExperienceEditor({
    items,
    onChange,
}: {
    items: ExpItem[];
    onChange: (v: ExpItem[]) => void;
}) {
    const empty: ExpItem = { id: safeUUID(), title: '', org: '', tag: '', bullets: '', present: false };

    const [draft, setDraft] = useState<ExpItem>(empty);
    const [editingId, setEditingId] = useState<string | null>(null);

    function resetForm() {
        setDraft({ ...empty, id: safeUUID() });
        setEditingId(null);
    }

    function addOrUpdate() {
        if (!draft.title.trim()) return;
        if (editingId) onChange(items.map(it => (it.id === editingId ? draft : it)));
        else onChange([...items, draft]);
        resetForm();
    }

    function edit(it: ExpItem) {
        setDraft({ ...it });
        setEditingId(it.id);
    }

    function remove(id: string) {
        onChange(items.filter(it => it.id !== id));
        if (editingId === id) resetForm();
    }

    return (
        <div className="space-y-4">
            {/* form */}
            <div className={`rounded-2xl border p-4 ${GREEN.cardBorder} bg-white`}>
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <Label>Jabatan / Posisi</Label>
                        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Production Engineer / Teknisi Software" />
                    </div>
                    <div>
                        <Label>Organisasi / Perusahaan</Label>
                        <Input value={draft.org} onChange={(e) => setDraft({ ...draft, org: e.target.value })} placeholder="PT Oilfield / UKM Robotik" />
                    </div>
                    <div>
                        <Label>Label (opsional)</Label>
                        <Input value={draft.tag || ''} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} placeholder="Organisasi / Magang / Full-time" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Tahun Mulai</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={draft.startMonth || ''} onChange={(e) => setDraft({ ...draft, startMonth: (e.target.value as MonthKey) || undefined })}>
                                    <option value="">Bulan</option>
                                    {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                                </Select>
                                <Input
                                    inputMode="numeric"
                                    pattern="\d{4}"
                                    placeholder="2024"
                                    value={draft.startYear ?? ''}
                                    onChange={(e) => setDraft({ ...draft, startYear: e.target.value ? Number(e.target.value) : undefined })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Tahun Selesai</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    value={draft.present ? '' : (draft.endMonth || '')}
                                    onChange={(e) => setDraft({ ...draft, endMonth: (e.target.value as MonthKey) || undefined })}
                                    disabled={draft.present}
                                    className={draft.present ? 'bg-emerald-50 text-emerald-900/60' : ''}
                                >
                                    <option value="">Bulan</option>
                                    {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                                </Select>
                                <Input
                                    inputMode="numeric"
                                    pattern="\d{4}"
                                    placeholder="2025"
                                    value={draft.present ? '' : (draft.endYear ?? '')}
                                    onChange={(e) => setDraft({ ...draft, endYear: e.target.value ? Number(e.target.value) : undefined })}
                                    disabled={draft.present}
                                    className={draft.present ? 'bg-emerald-50 text-emerald-900/60' : ''}
                                />
                            </div>
                            <label className={`mt-2 inline-flex items-center gap-2 text-xs ${GREEN.textBody}`}>
                                <input
                                    type="checkbox"
                                    checked={draft.present || false}
                                    onChange={(e) => setDraft({ ...draft, present: e.target.checked })}
                                    className="accent-emerald-700"
                                />
                                Sampai sekarang
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <Label>Deskripsi (1 baris = 1 bullet)</Label>
                        <Textarea
                            value={draft.bullets || ''}
                            onChange={(e) => setDraft({ ...draft, bullets: e.target.value })}
                            placeholder={`Contoh:\nMonitoring produksi harian...\nKoordinasi dengan tim operasi offshore...`}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <button
                        onClick={addOrUpdate}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${GREEN.btnPrimary}`}
                    >
                        {editingId ? 'Simpan Perubahan' : 'Tambah Pengalaman'}
                    </button>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className={`rounded-xl border px-3 py-2 text-sm ${GREEN.btnOutline}`}
                        >
                            Batal
                        </button>
                    )}
                </div>
            </div>

            {/* list */}
            {items.length > 0 && (
                <ul className="space-y-2">
                    {items.map(it => (
                        <li key={it.id} className={`flex items-center justify-between rounded-2xl border p-3 ${GREEN.cardBorder} bg-white`}>
                            <div className="min-w-0">
                                <p className={`text-sm font-medium ${GREEN.textTitle}`}>
                                    {it.title} {it.org ? <span className={GREEN.textBody}>· {it.org}</span> : null}
                                </p>
                                <p className={`text-xs ${GREEN.textMuted}`}>{rangeToText(it.startMonth, it.startYear, it.endMonth, it.endYear, it.present)}</p>
                            </div>
                            <div className="shrink-0 space-x-2">
                                <button onClick={() => edit(it)} className={`rounded-lg border px-2 py-1 text-xs ${GREEN.btnOutline}`}>
                                    Edit
                                </button>
                                <button onClick={() => remove(it.id)} className={`rounded-lg border px-2 py-1 text-xs ${GREEN.dangerOutline}`}>
                                    Hapus
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* =========================================================
   Education Editor
========================================================= */
function EducationEditor({
    items,
    onChange,
}: {
    items: EduItem[];
    onChange: (v: EduItem[]) => void;
}) {
    const empty: EduItem = { id: safeUUID(), school: '', degree: '', gpa: '', present: false };

    const [draft, setDraft] = useState<EduItem>(empty);
    const [editingId, setEditingId] = useState<string | null>(null);

    function resetForm() {
        setDraft({ ...empty, id: safeUUID() });
        setEditingId(null);
    }

    function addOrUpdate() {
        if (!draft.school.trim()) return;
        if (editingId) onChange(items.map(it => (it.id === editingId ? draft : it)));
        else onChange([...items, draft]);
        resetForm();
    }

    function edit(it: EduItem) {
        setDraft({ ...it });
        setEditingId(it.id);
    }

    function remove(id: string) {
        onChange(items.filter(it => it.id !== id));
        if (editingId === id) resetForm();
    }

    return (
        <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${GREEN.cardBorder} bg-white`}>
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <Label>Institusi</Label>
                        <Input value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} placeholder="Universitas / Politeknik" />
                    </div>
                    <div>
                        <Label>Program / Gelar</Label>
                        <Input value={draft.degree || ''} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="S1 Teknik Perminyakan" />
                    </div>
                    <div>
                        <Label>IPK</Label>
                        <Input value={draft.gpa || ''} onChange={(e) => setDraft({ ...draft, gpa: e.target.value })} placeholder="3.75" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Tahun Mulai</Label>
                            <Input
                                inputMode="numeric"
                                pattern="\d{4}"
                                placeholder="2021"
                                value={draft.startYear ?? ''}
                                onChange={(e) => setDraft({ ...draft, startYear: e.target.value ? Number(e.target.value) : undefined })}
                            />
                        </div>
                        <div>
                            <Label>Tahun Selesai</Label>
                            <Input
                                inputMode="numeric"
                                pattern="\d{4}"
                                placeholder="2025"
                                value={draft.present ? '' : (draft.endYear ?? '')}
                                onChange={(e) => setDraft({ ...draft, endYear: e.target.value ? Number(e.target.value) : undefined })}
                                disabled={draft.present}
                                className={draft.present ? 'bg-emerald-50 text-emerald-900/60' : ''}
                            />
                            <label className={`mt-2 inline-flex items-center gap-2 text-xs ${GREEN.textBody}`}>
                                <input
                                    type="checkbox"
                                    checked={draft.present || false}
                                    onChange={(e) => setDraft({ ...draft, present: e.target.checked })}
                                    className="accent-emerald-700"
                                />
                                Sampai sekarang
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <button onClick={addOrUpdate} className={`rounded-xl px-4 py-2 text-sm font-semibold ${GREEN.btnPrimary}`}>
                        {editingId ? 'Simpan Perubahan' : 'Tambah Pendidikan'}
                    </button>
                    {editingId && (
                        <button onClick={resetForm} className={`rounded-xl border px-3 py-2 text-sm ${GREEN.btnOutline}`}>
                            Batal
                        </button>
                    )}
                </div>
            </div>

            {items.length > 0 && (
                <ul className="space-y-2">
                    {items.map(it => (
                        <li key={it.id} className={`flex items-center justify-between rounded-2xl border p-3 ${GREEN.cardBorder} bg-white`}>
                            <div className="min-w-0">
                                <p className={`text-sm font-medium ${GREEN.textTitle}`}>
                                    {it.school} {it.degree ? <span className={GREEN.textBody}>· {it.degree}</span> : null}
                                </p>
                                <p className={`text-xs ${GREEN.textMuted}`}>
                                    {it.gpa ? `IPK ${it.gpa} · ` : ''}{rangeToText(undefined, it.startYear, undefined, it.endYear, it.present)}
                                </p>
                            </div>
                            <div className="shrink-0 space-x-2">
                                <button onClick={() => edit(it)} className={`rounded-lg border px-2 py-1 text-xs ${GREEN.btnOutline}`}>Edit</button>
                                <button onClick={() => remove(it.id)} className={`rounded-lg border px-2 py-1 text-xs ${GREEN.dangerOutline}`}>Hapus</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* =========================================================
   PREVIEW building blocks
========================================================= */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={`mb-2 border-b pb-1 text-[12.5px] font-semibold tracking-wide uppercase ${GREEN.sectionLine} text-emerald-900`}>
            {children}
        </h2>
    );
}

function ExpPreview({ items }: { items: ExpItem[] }) {
    if (!items.length) return <p className={`text-[13px] ${GREEN.textMuted}`}>—</p>;
    return (
        <div className="space-y-4">
            {items.map((it) => {
                const right = rangeToText(it.startMonth, it.startYear, it.endMonth, it.endYear, it.present);
                const bullets = (it.bullets || '').split('\n').map(s => s.trim()).filter(Boolean);
                return (
                    <div key={it.id} className="break-inside-avoid">
                        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                            <p className="text-[13px] font-semibold text-emerald-950 min-w-0 break-words">
                                {it.title}
                            </p>
                            {right ? (
                                <p className="text-[12px] text-emerald-900/60 whitespace-nowrap tabular-nums justify-self-end">
                                    {right}
                                </p>
                            ) : null}
                        </div>
                        {(it.org || it.tag) && (
                            <p className="mt-0.5 text-[12.5px] text-emerald-900/80">
                                {[it.org, it.tag].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        {bullets.length > 0 && (
                            <ul className="mt-1 list-disc pl-5 text-[13px] leading-6 text-emerald-950">
                                {bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function EduPreview({ items }: { items: EduItem[] }) {
    if (!items.length) return <p className={`text-[13px] ${GREEN.textMuted}`}>—</p>;
    return (
        <div className="space-y-4">
            {items.map((it) => {
                const right = rangeToText(undefined, it.startYear, undefined, it.endYear, it.present);
                return (
                    <div key={it.id} className="break-inside-avoid">
                        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                            <p className="text-[13px] font-semibold text-emerald-950 min-w-0 break-words">
                                {it.school}
                            </p>
                            {right ? (
                                <p className="text-[12px] text-emerald-900/60 whitespace-nowrap tabular-nums justify-self-end">
                                    {right}
                                </p>
                            ) : null}
                        </div>
                        {(it.degree || it.gpa) && (
                            <p className="mt-0.5 text-[12.5px] text-emerald-900/80">
                                {[it.degree, it.gpa ? `IPK ${it.gpa}` : ''].filter(Boolean).join(' · ')}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* =========================================================
   Modal Preview + Download PDF
========================================================= */
function AtsCvModal({
    onClose,
    data,
}: {
    onClose: () => void;
    data: CvDraft;
}) {
    const hardSkills = (data.hardSkillsCsv || (data.skills?.length ? data.skills.join(', ') : '')).trim();
    const softSkills = (data.softSkillsCsv || '').trim();

    const downloadAsPDF = async () => {
        const el = document.querySelector('.cv-a4') as HTMLElement | null;
        if (!el) return;
        const html2pdf = (await import('html2pdf.js')).default;
        const filenameSafe = (data.name || 'CV_ATS').replace(/\s+/g, '_');

        await html2pdf()
            .set({
                margin: 0,
                filename: `${filenameSafe}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: el.scrollWidth,
                    windowHeight: el.scrollHeight,
                    letterRendering: true,
                },
                // @ts-ignore
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(el)
            .save();
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-emerald-950/40 print:hidden" data-modal-chrome onClick={onClose} />
            <div className="relative m-3 w-[min(95vw,900px)] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-emerald-950/20">
                {/* Modal chrome */}
                <div className="flex items-center justify-between border-b border-emerald-200 px-4 py-3 print:hidden" data-modal-chrome>
                    <div className="text-sm font-medium text-emerald-950">Preview CV</div>
                    <div className="flex items-center gap-2">
                        <button onClick={downloadAsPDF} className={`rounded-xl px-4 py-2 text-sm font-semibold ${GREEN.btnPrimary}`}>
                            Download PDF
                        </button>
                        <button onClick={onClose} className={`rounded-xl border px-3 py-2 text-sm ${GREEN.btnOutline}`}>
                            Tutup
                        </button>
                    </div>
                </div>

                {/* A4 content */}
                <div className="cv-scroll max-h-[82vh] overflow-auto p-4 print:p-0">
                    <div className="cv-a4 mx-auto bg-white shadow avoid-break">
                        {/* HEADER */}
                        <header className="px-9 pt-10 pb-4 border-b border-emerald-200">
                            <h1 className="text-[18px] font-extrabold tracking-widest uppercase text-emerald-950">
                                {data.name || 'Nama Lengkap'}
                            </h1>
                            <p className="mt-1 text-[12.5px] text-emerald-900/80">
                                {data.location ? `${data.location} | ` : ''}{data.email}{data.phone ? ` | ${data.phone}` : ''}
                            </p>
                            {data.about && (
                                <p className="mt-3 text-[13px] leading-6 text-emerald-950">
                                    {data.about}
                                </p>
                            )}
                        </header>

                        {/* BODY */}
                        <section className="px-9 py-6">
                            <section className="mb-5 break-inside-avoid avoid-break">
                                <SectionTitle>PENGALAMAN</SectionTitle>
                                <ExpPreview items={data.experiences} />
                            </section>

                            <section className="mb-5 break-inside-avoid avoid-break">
                                <SectionTitle>PENDIDIKAN</SectionTitle>
                                <EduPreview items={data.educations} />
                            </section>

                            <section className="mb-5 break-inside-avoid avoid-break">
                                <SectionTitle>KEAHLIAN</SectionTitle>
                                <div className="space-y-1.5 text-[13px] leading-6 text-emerald-950">
                                    <p><span className="font-semibold">Hard Skills</span> : {hardSkills || '—'}</p>
                                    <p><span className="font-semibold">Soft Skills</span> : {softSkills || '—'}</p>
                                </div>
                            </section>
                        </section>
                    </div>
                </div>
            </div>

            {/* PRINT & A4 CSS */}
            <style jsx global>{`
        .cv-a4, .cv-a4 * { box-sizing: border-box; }

        .cv-a4{
          width: 210mm;
          min-height: 297mm;
          padding: 12mm 14mm;
          background: #fff;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(6,95,70,.08);
        }
        .avoid-break { page-break-inside: avoid; }

        @media print {
          .print\\:hidden,
          [data-modal-chrome],
          body > div[role="dialog"] > div:first-child { display: none !important; }
          .cv-scroll{ max-height: none !important; overflow: visible !important; padding: 0 !important; }
          .cv-a4{
            width: 210mm !important;
            min-height: 297mm !important;
            border: 0 !important; border-radius: 0 !important; box-shadow: none !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
        </div>
    );
}

/* =========================================================
   MAIN PAGE EXPORT (Hydration Wrapper)
========================================================= */
export default function CreateCvPage() {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => { setHydrated(true); }, []);
    if (!hydrated) return null;
    return <CreateCvPageInner />;
}

/* =========================================================
   INNER PAGE
========================================================= */
function CreateCvPageInner() {
    const { user } = useAuth();
    const router = useRouter();

    const email = user?.email ?? null;
    const notSignedIn = !email;

    useEffect(() => {
        if (notSignedIn) {
            const id = setTimeout(() => router.replace('/auth/signin'), 50);
            return () => clearTimeout(id);
        }
    }, [notSignedIn, router]);

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [about, setAbout] = useState('');

    const [experiences, setExperiences] = useState<ExpItem[]>([]);
    const [educations, setEducations] = useState<EduItem[]>([]);

    const [hardSkillsCsv, setHardSkillsCsv] = useState('');
    const [softSkillsCsv, setSoftSkillsCsv] = useState('');
    const [legacySkills, setLegacySkills] = useState<string[]>([]);

    const [toast, setToast] = useState<Toast>(null);
    const [busy, setBusy] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(id);
    }, [toast]);

    useEffect(() => {
        if (!email) return;
        try {
            const obj = JSON.parse(localStorage.getItem(LS_DRAFTS_KEY) ?? '{}');
            const draft: CvDraft | undefined = obj[email];
            if (draft) {
                setName(draft.name || '');
                setPhone(draft.phone || '');
                setLocation(draft.location || '');
                setAbout(draft.about || '');
                setExperiences(draft.experiences || []);
                setEducations(draft.educations || []);
                setHardSkillsCsv(draft.hardSkillsCsv || '');
                setSoftSkillsCsv(draft.softSkillsCsv || '');
                setLegacySkills(draft.skills || []);
            } else {
                const users = JSON.parse(localStorage.getItem(LS_PROFILE_KEY) ?? '[]') as any[];
                const u = users.find((x) => x.email === email);
                if (u) {
                    setName((u.name as string) || '');
                    setPhone(u?.profile?.phone ?? '');
                    setLocation(u?.profile?.location ?? '');
                    setAbout(u?.profile?.about ?? '');
                    const arr = String(u?.profile?.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
                    setLegacySkills(arr);
                    if (!hardSkillsCsv && arr.length) setHardSkillsCsv(arr.join(', '));
                }
            }
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    function saveDraft() {
        if (!email) return;
        setBusy(true);
        try {
            const existing = JSON.parse(localStorage.getItem(LS_DRAFTS_KEY) ?? '{}');
            const payload: CvDraft = {
                name,
                email,
                location,
                phone,
                about,
                experiences,
                educations,
                hardSkillsCsv,
                softSkillsCsv,
                skills: legacySkills,
            };
            existing[email] = payload;
            localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(existing));
            setToast({ type: 'success', message: 'Draft CV tersimpan.' });
        } catch {
            setToast({ type: 'error', message: 'Gagal menyimpan draft.' });
        } finally {
            setBusy(false);
        }
    }

    function clearAll() {
        setName(''); setLocation(''); setPhone(''); setAbout('');
        setExperiences([]); setEducations([]);
        setHardSkillsCsv(''); setSoftSkillsCsv(''); setLegacySkills([]);
    }

    if (notSignedIn) {
        return (
            <div className="grid min-h-[60vh] place-items-center px-4">
                <div className="text-center">
                    <p className="text-sm text-emerald-900/70">Mengarahkan ke halaman masuk…</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${GREEN.pageBg} py-10`}>
            <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${GREEN.btnOutline} bg-white shadow-sm transition hover:-translate-y-0.5`}
                            aria-label="Kembali"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5m7-7-7 7 7 7" />
                            </svg>
                        </button>
                        <h1 className={`text-2xl font-semibold tracking-tight ${GREEN.textTitle}`}>
                            Buat CV (ATS)
                        </h1>
                    </div>
                </div>

                {/* Toast */}
                <ToastBanner toast={toast} onClose={() => setToast(null)} />

                {/* Card Basic */}
                <div className={`rounded-2xl border p-6 ${GREEN.cardBorder} ${GREEN.cardBg} ${GREEN.shadow}`}>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <Label>Nama Lengkap</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input readOnly value={email ?? ''} className="bg-emerald-50 text-emerald-900/70" />
                        </div>

                        <div className="md:col-span-2">
                            <Label>Lokasi</Label>
                            <WilayahSelect value={location} onChange={setLocation} />
                        </div>

                        <div>
                            <Label>Nomor HP</Label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxx" />
                        </div>

                        <div className="md:col-span-2">
                            <Label>Ringkasan (About)</Label>
                            <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tuliskan ringkasan singkat (1–3 kalimat)." />
                        </div>
                    </div>
                </div>

                {/* Card Experience */}
                <div className={`rounded-2xl border p-6 ${GREEN.cardBorder} ${GREEN.cardBg} ${GREEN.shadow}`}>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${GREEN.textTitle}`}>Pengalaman</h3>
                    </div>
                    <ExperienceEditor items={experiences} onChange={setExperiences} />
                </div>

                {/* Card Education */}
                <div className={`rounded-2xl border p-6 ${GREEN.cardBorder} ${GREEN.cardBg} ${GREEN.shadow}`}>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${GREEN.textTitle}`}>Pendidikan</h3>
                    </div>
                    <EducationEditor items={educations} onChange={setEducations} />
                </div>

                {/* Card Skills (Oil & Gas) */}
                <div className={`rounded-2xl border p-6 ${GREEN.cardBorder} ${GREEN.cardBg} ${GREEN.shadow}`}>
                    <h3 className={`mb-3 text-lg font-semibold ${GREEN.textTitle}`}>Keahlian (Oil & Gas)</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <Label>Hard Skills (CSV)</Label>
                            <Input value={hardSkillsCsv} onChange={(e) => setHardSkillsCsv(e.target.value)} placeholder="Reservoir Engineering, Drilling Engineer,..." />
                            <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-auto">
                                {OG_HARD_SKILLS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setHardSkillsCsv(v => {
                                            const arr = v.split(',').map(t => t.trim()).filter(Boolean);
                                            if (arr.includes(s)) return v;
                                            return (v ? v + ', ' : '') + s;
                                        })}
                                        className={`rounded-full border px-3 py-1 text-xs ${GREEN.chip}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Soft Skills (CSV)</Label>
                            <Input value={softSkillsCsv} onChange={(e) => setSoftSkillsCsv(e.target.value)} placeholder="Safety Mindset (HSE), Teamwork (Offshore/Onshore), ..." />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {OG_SOFT_SKILLS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSoftSkillsCsv(v => {
                                            const arr = v.split(',').map(t => t.trim()).filter(Boolean);
                                            if (arr.includes(s)) return v;
                                            return (v ? v + ', ' : '') + s;
                                        })}
                                        className={`rounded-full border px-3 py-1 text-xs ${GREEN.chip}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(true)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium ${GREEN.btnOutline}`}
                    >
                        Preview & Download
                    </button>

                    <button
                        onClick={saveDraft}
                        disabled={busy}
                        className={[
                            'rounded-xl px-5 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
                            GREEN.btnPrimary,
                        ].join(' ')}
                    >
                        {busy ? 'Menyimpan…' : 'Simpan Draft'}
                    </button>

                    <button
                        onClick={clearAll}
                        className={`rounded-xl border px-3 py-2 text-sm ${GREEN.btnOutline}`}
                    >
                        Kosongkan Semua
                    </button>
                </div>
            </div>

            {/* Modal Preview */}
            {showPreview && (
                <AtsCvModal
                    onClose={() => setShowPreview(false)}
                    data={{
                        name,
                        email: email!,
                        location,
                        phone,
                        about,
                        experiences,
                        educations,
                        hardSkillsCsv,
                        softSkillsCsv,
                        skills: legacySkills,
                    }}
                />
            )}
        </div>
    );
}

/* =========================================================
   Wilayah Select
========================================================= */
type Opt = { id: string; name: string };

function WilayahSelect({
    value,
    onChange,
    labelProv = 'Provinsi',
    labelKab = 'Kabupaten/Kota',
    labelKec = 'Kecamatan',
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

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/wilayah/provinces');
                const data = await r.json();
                setProvinces(data.items || []);
            } catch { setProvinces([]); }
        })();
    }, []);

    useEffect(() => {
        if (!prov) { setRegencies([]); setKab(null); setDistricts([]); setKec(null); return; }
        (async () => {
            try {
                const r = await fetch(`/api/wilayah/regencies/${prov.id}`);
                const data = await r.json();
                setRegencies(data.items || []); setKab(null); setDistricts([]); setKec(null);
            } catch { setRegencies([]); setKab(null); }
        })();
    }, [prov?.id]);

    useEffect(() => {
        if (!kab) { setDistricts([]); setKec(null); return; }
        (async () => {
            try {
                const r = await fetch(`/api/wilayah/districts/${kab.id}`);
                const data = await r.json();
                setDistricts(data.items || []); setKec(null);
            } catch { setDistricts([]); setKec(null); }
        })();
    }, [kab?.id]);

    useEffect(() => {
        const parts = [kec?.name, kab?.name, prov?.name].filter(Boolean);
        onChange(parts.join(', '));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prov, kab, kec]);

    const SelectBox = ({
        value, setValue, options, placeholder, disabled
    }: {
        value: Opt | null;
        setValue: (o: Opt | null) => void;
        options: Opt[];
        placeholder: string;
        disabled?: boolean;
    }) => (
        <div className="relative">
            <select
                value={value?.id || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    const o = options.find((x) => x.id === val) || null;
                    setValue(o);
                }}
                disabled={disabled}
                className={[
                    'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition',
                    GREEN.inputBorder,
                    GREEN.inputFocus,
                    disabled ? 'bg-emerald-50 text-emerald-900/60' : 'text-emerald-950',
                ].join(' ')}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/50">▾</span>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <span className="mb-1 block text-sm text-emerald-900/80">{labelProv}</span>
                    <SelectBox value={prov} setValue={setProv} options={provinces} placeholder="Pilih provinsi…" />
                </div>
                <div>
                    <span className="mb-1 block text-sm text-emerald-900/80">{labelKab}</span>
                    <SelectBox value={kab} setValue={setKab} options={regencies} placeholder="Pilih kab/kota…" disabled={!prov} />
                </div>
                <div>
                    <span className="mb-1 block text-sm text-emerald-900/80">{labelKec}</span>
                    <SelectBox value={kec} setValue={setKec} options={districts} placeholder="Pilih kecamatan…" disabled={!kab} />
                </div>
            </div>

            {value && (
                <div className="text-xs text-emerald-900/60">
                    Dipilih: <span className="font-medium text-emerald-950">{value}</span>
                </div>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => { setProv(null); setKab(null); setKec(null); onChange('Remote'); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${GREEN.btnOutline}`}
                >
                    Pilih “Remote”
                </button>
            </div>
        </div>
    );
}
