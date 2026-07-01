'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SEO from '@/app/components/SEO';

export default function AdminPendingStreetsPage() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('pendingStreets');
    setPending(stored ? JSON.parse(stored) : []);
  }, []);

  const handleApprove = async (index: number) => {
    const approvedStreet = pending[index];

    const res = await fetch('/api/approve-street', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvedStreet),
    });

    if (!res.ok) {
      alert('❌ Failed to save to streets.json');
      return;
    }

    const updated = [...pending];
    updated.splice(index, 1);
    setPending(updated);
    localStorage.setItem('pendingStreets', JSON.stringify(updated));

    alert(`✅ ${approvedStreet.name} approved and added to streets.json`);
  };

  const handleReject = (index: number) => {
    const updated = [...pending];
    updated.splice(index, 1);
    setPending(updated);
    localStorage.setItem('pendingStreets', JSON.stringify(updated));
  };

  return (
    <>
      <SEO
        title="Admin: Pending Street Approvals | LocalStreetShop"
        description="Review and approve newly submitted streets from users."
        url="https://www.localstreetshop.com/admin/pending-streets"
        noindex
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/admin"
            className="inline-block mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back to Admin
          </Link>

          <section className="text-center mb-8">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop Admin
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Pending Street Submissions
            </h1>

            <p className="text-gray-600">
              Review and approve newly submitted streets.
            </p>
          </section>

          {pending.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                No pending streets
              </h2>
              <p className="text-gray-600">
                There are no street submissions waiting for approval right now.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pending.map((street, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-blue-700 mb-3">
                    {street.name}
                  </h2>

                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>City:</strong> {street.citySlug}
                    </p>
                    <p>
                      <strong>Province:</strong> {street.provinceSlug}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      onClick={() => handleApprove(index)}
                      className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(index)}
                      className="bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}