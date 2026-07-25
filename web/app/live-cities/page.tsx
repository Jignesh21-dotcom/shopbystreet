import { Suspense } from 'react';
import LiveCitiesClient from './LiveCitiesClient';

export default function LiveCitiesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-gray-700">Loading live cities...</p>
            </div>
          </div>
        </main>
      }
    >
      <LiveCitiesClient />
    </Suspense>
  );
}