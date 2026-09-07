import { Suspense } from 'react';
import ActiveShopsClient from './ActiveShopsClient';

export default function ActiveShopsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
          <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-700">Loading active shops...</p>
          </div>
        </main>
      }
    >
      <ActiveShopsClient />
    </Suspense>
  );
}
