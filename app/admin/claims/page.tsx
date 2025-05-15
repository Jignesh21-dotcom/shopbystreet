'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Claim = {
  id: string;
  message: string;
  created_at: string;
  shop: { id: string; name: string };
  user: { id: string; email: string };
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shop_claims')
      .select(`
        id,
        message,
        created_at,
        shop:shop_id (id, name),
        user:user_id (id, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch claims:', error.message);
    } else {
      // Safely unwrap nested data
      const unwrappedClaims = (data || []).map((claim: any) => ({
        ...claim,
        shop: Array.isArray(claim.shop) ? claim.shop[0] : claim.shop,
        user: Array.isArray(claim.user) ? claim.user[0] : claim.user,
      }));
      setClaims(unwrappedClaims);
    }

    setLoading(false);
  };

  const approveClaim = async (claim: Claim) => {
    // Step 1: Set shop.owner_id to user
    const { error: updateError } = await supabase
      .from('shops')
      .update({ owner_id: claim.user.id })
      .eq('id', claim.shop.id);

    if (updateError) {
      alert('Failed to assign shop owner.');
      return;
    }

    // Step 2: Mark claim as approved
    const { error: claimError } = await supabase
      .from('shop_claims')
      .update({ status: 'approved', reviewed_at: new Date() })
      .eq('id', claim.id);

    if (claimError) {
      alert('Failed to update claim status.');
    } else {
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
    }
  };

  const rejectClaim = async (id: string) => {
    const confirm = window.confirm('Reject this claim request?');
    if (!confirm) return;

    const { error } = await supabase
      .from('shop_claims')
      .update({ status: 'rejected', reviewed_at: new Date() })
      .eq('id', id);

    if (!error) {
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert('Failed to reject claim.');
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">📋 Admin: Shop Claim Requests</h1>

      {loading ? (
        <p>Loading claims...</p>
      ) : claims.length === 0 ? (
        <p className="text-green-600 font-semibold">✅ No pending claims to review.</p>
      ) : (
        <ul className="space-y-6">
          {claims.map((claim) => (
            <li
              key={claim.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="text-lg font-semibold text-gray-800">{claim.shop.name}</div>
              <p className="text-sm text-gray-600 mb-1">
                Claimed by: <strong>{claim.user.email}</strong>
              </p>
              <p className="text-sm text-gray-700 italic">
                {claim.message || 'No message provided.'}
              </p>
              <div className="flex space-x-4 mt-3">
                <button
                  onClick={() => approveClaim(claim)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => rejectClaim(claim.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}