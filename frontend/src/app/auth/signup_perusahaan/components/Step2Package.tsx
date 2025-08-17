// frontend/src/app/auth/signup_perusahaan/components/Step2Package.tsx
'use client';

import Card from './Card';
import { Package, PackageId } from '../types';
import { classNames, formatIDR } from '../utils';

export default function Step2Package({
  packages, selected, setSelected, onBack, onNext,
}: {
  packages: Package[];
  selected: PackageId;
  setSelected: (v: PackageId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const current = packages.find((p) => p.id === selected)!;

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-slate-900">Pilih Paket</h2>
      <p className="mt-1 text-sm text-slate-600">Pilih paket sesuai kebutuhan. Bisa upgrade kapan saja.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => {
          const active = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={classNames(
                'text-left rounded-2xl border p-5 transition focus:outline-none',
                active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-baseline justify-between">
                <h3 className={classNames('text-lg font-semibold', active ? 'text-blue-700' : 'text-slate-900')}>
                  {p.title}
                </h3>
                <div className={classNames('text-sm', active ? 'text-blue-600' : 'text-slate-500')}>
                  {formatIDR(p.price)}
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Paket dipilih</span>
          <span className="font-semibold text-slate-900">{current.title}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-900">{formatIDR(current.price)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-slate-50">
          Kembali
        </button>
        <button onClick={onNext} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Selanjutnya
        </button>
      </div>
    </Card>
  );
}
