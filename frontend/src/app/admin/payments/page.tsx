'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type Plan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  amount: number;
  currency: string;   // 'IDR'
  interval: string;   // 'month' | 'year'
  active: boolean;
  priceId?: string | null;
};

type CheckoutRes = {
  token: string;
  redirect_url: string;
  orderId: string;
  amount: number;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, cb?: any) => void;
    };
  }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '';

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function PaymentsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [planId, setPlanId] = useState<string>('');
  const [employerId, setEmployerId] = useState<string>(''); // isi ID employer yang akan diberi paket
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutRes | null>(null);
  const [status, setStatus] = useState<string>(''); // status payment (polling)

  const selectedPlan = useMemo(() => plans.find(p => p.id === planId), [plans, planId]);

  // load plans
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await api<Plan[]>('/admin/plans');
        setPlans(data.filter(p => p.active));
        if (data.length > 0 && !planId) setPlanId(data[0].id);
      } catch (e: any) {
        setErr(e?.message || 'Gagal memuat paket');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  // load Snap.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.snap || !MIDTRANS_CLIENT_KEY) return;
    const s = document.createElement('script');
    s.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  // polling status setelah checkout
  useEffect(() => {
    if (!checkout?.orderId) return;
    let stop = false;
    const tick = async () => {
      try {
        const p = await api<any>(`/api/payments/${checkout.orderId}`);
        setStatus(p?.status || '');
        // berhenti jika settle/expire/cancel
        if (['settlement', 'expire', 'cancel', 'deny', 'refund'].includes(p?.status)) return;
      } catch {
        // ignore
      }
      if (!stop) setTimeout(tick, 2500);
    };
    tick();
    return () => { stop = true; };
  }, [checkout?.orderId]);

  async function handlePay() {
    if (!planId || !email) {
      setErr('Plan dan email wajib diisi.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const payload = {
        planId,
        employerId: employerId || undefined,
        customer: { email, first_name: firstName, last_name: lastName, phone },
      };
      const res = await api<CheckoutRes>('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setCheckout(res);

      // Snap preferred
      if (window.snap?.pay) {
        window.snap.pay(res.token, {
          onSuccess: () => setStatus('settlement'),
          onPending: () => setStatus('pending'),
          onError: () => setStatus('error'),
          onClose: () => setStatus(s => s || 'closed'),
        });
      } else {
        // fallback open redirect_url
        window.open(res.redirect_url, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      setErr(e?.message || 'Gagal memulai pembayaran');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Payments (Midtrans)</h1>
        <p className="text-sm text-slate-600">
          Buat transaksi Snap untuk paket yang dipilih. Halaman ini membantu admin melakukan uji coba pembayaran.
        </p>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700">{err}</div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form kiri */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Data Transaksi</h2>

            <div className="grid gap-3">
              <label className="block text-sm">
                <div className="mb-1 text-slate-600">Paket</div>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {fmtIDR(p.amount)} / {p.interval}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <div className="mb-1 text-slate-600">Employer ID (opsional)</div>
                <input
                  value={employerId}
                  onChange={(e) => setEmployerId(e.target.value)}
                  placeholder="uuid employer (jika ada)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <div className="mb-1 text-slate-600">Email Customer</div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="customer@email.com"
                  />
                </label>
                <label className="block text-sm">
                  <div className="mb-1 text-slate-600">Telepon (opsional)</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="08xxxxxxxxxx"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <div className="mb-1 text-slate-600">Nama Depan</div>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <div className="mb-1 text-slate-600">Nama Belakang</div>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <button
                onClick={handlePay}
                disabled={busy || !planId || !email}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? 'Membuat transaksi…' : 'Buat Pembayaran'}
              </button>

              {!MIDTRANS_CLIENT_KEY && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <b>Warning:</b> <code>NEXT_PUBLIC_MIDTRANS_CLIENT_KEY</code> belum diset. Snap tidak bisa dibuka,
                  sistem akan membuka <em>redirect_url</em> saja.
                </p>
              )}
            </div>
          </div>

          {/* Preview kanan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Ringkasan</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Paket">{selectedPlan?.name ?? '-'}</Row>
              <Row label="Harga">{selectedPlan ? fmtIDR(selectedPlan.amount) : '-'}</Row>
              <Row label="Interval">{selectedPlan?.interval ?? '-'}</Row>
              <Row label="Email">{email || '-'}</Row>
              <Row label="Employer ID">{employerId || '-'}</Row>
            </dl>

            {checkout && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
                <div className="font-semibold text-blue-900">Transaksi dibuat</div>
                <div className="mt-1 text-blue-800">
                  Order ID: <code className="font-mono">{checkout.orderId}</code>
                </div>
                <div className="mt-1">
                  <button
                    onClick={() =>
                      window.snap?.pay
                        ? window.snap.pay(checkout.token)
                        : window.open(checkout.redirect_url, '_blank', 'noopener,noreferrer')
                    }
                    className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                  >
                    Buka Snap
                  </button>
                </div>
              </div>
            )}

            {status && (
              <div className="mt-4 rounded-xl border px-3 py-2 text-sm"
                   style={{ borderColor: '#cbd5e1', background: '#f8fafc' }}>
                Status transaksi: <b>{status}</b>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-1 text-slate-500">{label}</div>
      <div className="col-span-2 font-medium text-slate-800 break-all">{children}</div>
    </div>
  );
}
