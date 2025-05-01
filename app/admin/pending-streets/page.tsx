'use client';

import { useEffect, useState } from 'react';

export default function AdminPendingStreetsPage() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('pendingStreets');
    setPending(stored ? JSON.parse(stored) : []);
  }, []);

  const handleApprove = async (index: number) => {
    const approvedStreet = pending[index];

    // Send to backend API to write into streets.json
    const res = await fetch('/api/approve-street', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvedStreet)
    });

    if (!res.ok) {
      alert('❌ Failed to save to streets.json');
      return;
    }

    // Remove from pending
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
    <main className="min-h-screen p-8 bg-gradient-to-br from-red-50 to-yellow-100">
      <h1 className="text-3xl font-bold text-red-800 mb-6">🛠 Pending Street Submissions</h1>

      {pending.length === 0 ? (
        <p className="text-gray-600">No pending streets right now.</p>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {pending.map((street, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-400 space-y-2"
            >
              <p>
                <strong>Street:</strong> {street.name}
              </p>
              <p>
                <strong>City:</strong> {street.citySlug}
              </p>
              <p>
                <strong>Province:</strong> {street.provinceSlug}
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleApprove(index)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(index)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
