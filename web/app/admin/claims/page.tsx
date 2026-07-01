'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type ClaimStatus = 'pending' | 'approved' | 'rejected';

type Claim = {
  id: string;
  message: string | null;
  status: ClaimStatus;
  created_at: string;
  reviewed_at?: string | null;
  shop: {
    id: string;
    name: string;
    slug?: string;
    address?: string;
    owner_id?: string | null;
    street?: {
      name?: string;
      slug?: string;
      city?: {
        name?: string;
        slug?: string;
      } | null;
    } | null;
  } | null;
  user_id: string;
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClaimStatus>('pending');

  const fetchClaims = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('shop_claims')
      .select(`
        id,
        message,
        status,
        created_at,
        reviewed_at,
        user_id,
        shop:shop_id (
          id,
          name,
          slug,
          address,
          owner_id,
          street:street_id (
            name,
            slug,
            city:city_id (
              name,
              slug
            )
          )
        )
      `)
      .eq('status', statusFilter)
      .order('created_at', { ascending: false });

    if (error) {
      alert(`Failed to fetch claims: ${error.message}`);
      setClaims([]);
      setLoading(false);
      return;
    }

    const unwrappedClaims = (data || []).map((claim: any) => {
      let shop = claim.shop;

      if (Array.isArray(shop)) shop = shop[0] || null;

      if (shop?.street && Array.isArray(shop.street)) {
        shop.street = shop.street[0] || null;
      }

      if (shop?.street?.city && Array.isArray(shop.street.city)) {
        shop.street.city = shop.street.city[0] || null;
      }

      return {
        ...claim,
        shop,
      };
    });

    setClaims(unwrappedClaims);
    setLoading(false);
  };

  const approveClaim = async (claim: Claim) => {
    if (!claim.shop?.id) {
      alert('This claim is missing shop information.');
      return;
    }

    const confirmed = window.confirm(
      `Approve claim for "${claim.shop?.name}"? This will assign this shop to the requesting user.`
    );

    if (!confirmed) return;

    setActingId(claim.id);

    const { data: authData } = await supabase.auth.getUser();
    const adminUserId = authData?.user?.id || null;

    const { data: shopUpdateData, error: updateShopError } = await supabase
      .from('shops')
      .update({ owner_id: claim.user_id })
      .eq('id', claim.shop.id)
      .select('id, name, owner_id');

    if (updateShopError) {
      alert(`Failed to assign shop owner: ${updateShopError.message}`);
      setActingId(null);
      return;
    }

    if (!shopUpdateData || shopUpdateData.length === 0) {
      alert(
        'Shop update returned 0 rows. This usually means RLS is blocking the update or the admin policy is not matching your logged-in account.'
      );
      setActingId(null);
      return;
    }

    const { data: claimUpdateData, error: updateClaimError } = await supabase
      .from('shop_claims')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUserId,
      })
      .eq('id', claim.id)
      .select('id, status, reviewed_at, reviewed_by');

    if (updateClaimError) {
      alert(`Shop owner assigned, but claim status failed: ${updateClaimError.message}`);
      setActingId(null);
      return;
    }

    if (!claimUpdateData || claimUpdateData.length === 0) {
      alert(
        'Claim update returned 0 rows. This usually means RLS is blocking the shop_claims update.'
      );
      setActingId(null);
      return;
    }

    alert('✅ Claim approved and shop owner assigned.');
    setActingId(null);
    await fetchClaims();
  };

  const rejectClaim = async (claim: Claim) => {
    const confirmed = window.confirm(`Reject claim for "${claim.shop?.name || 'this shop'}"?`);

    if (!confirmed) return;

    setActingId(claim.id);

    const { data: authData } = await supabase.auth.getUser();
    const adminUserId = authData?.user?.id || null;

    const { data: rejectData, error } = await supabase
      .from('shop_claims')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUserId,
      })
      .eq('id', claim.id)
      .select('id, status, reviewed_at, reviewed_by');

    if (error) {
      alert(`Failed to reject claim: ${error.message}`);
      setActingId(null);
      return;
    }

    if (!rejectData || rejectData.length === 0) {
      alert(
        'Reject update returned 0 rows. This usually means RLS is blocking the update.'
      );
      setActingId(null);
      return;
    }

    alert('✅ Claim rejected.');
    setActingId(null);
    await fetchClaims();
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <>
      <SEO
        title="Admin: Shop Claims | LocalStreetShop"
        description="Review and approve shop ownership claims."
        url="https://www.localstreetshop.com/admin/claims"
        noindex
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/admin"
            className="inline-block mb-6 text-blue-700 hover:text-blue-900 hover:underline"
          >
            ← Back to Admin
          </Link>

          <section className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-widest">
                  Admin Panel
                </p>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">
                  📋 Shop Claim Requests
                </h1>
                <p className="text-gray-600 mt-2">
                  Review business ownership requests, approve valid claims, and assign shops to owners.
                </p>
              </div>

              <button
                onClick={fetchClaims}
                className="bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
              >
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {(['pending', 'approved', 'rejected'] as ClaimStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-full font-semibold capitalize ${
                    statusFilter === status
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="bg-white rounded-3xl shadow p-8 text-gray-600">
              Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div className="bg-white rounded-3xl shadow p-8 text-green-700 font-semibold">
              ✅ No {statusFilter} claims to review.
            </div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => {
                const shop = claim.shop;
                const street = shop?.street;
                const city = street?.city;

                const listingHref =
                  city?.slug && street?.slug && shop?.slug
                    ? `/cities/${city.slug}/${street.slug}/${shop.slug}`
                    : null;

                return (
                  <section
                    key={claim.id}
                    className="bg-white rounded-3xl shadow-md border border-gray-100 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                            claim.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700'
                              : claim.status === 'approved'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {claim.status.toUpperCase()}
                        </span>

                        <h2 className="text-2xl font-bold text-blue-800">
                          {shop?.name || 'Unknown Shop'}
                        </h2>

                        <p className="text-gray-600 mt-1">
                          {street?.name && <>Street: {street.name}</>}
                          {city?.name && <> | City: {city.name}</>}
                          {shop?.address && <> | Address: {shop.address}</>}
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                          User ID: <span className="font-mono">{claim.user_id}</span>
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Submitted:{' '}
                          {claim.created_at
                            ? new Date(claim.created_at).toLocaleString()
                            : 'Unknown'}
                        </p>

                        {claim.reviewed_at && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reviewed: {new Date(claim.reviewed_at).toLocaleString()}
                          </p>
                        )}

                        <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                          <p className="text-sm font-bold text-gray-700 mb-1">
                            Message
                          </p>
                          <p className="text-gray-700">
                            {claim.message || 'No message provided.'}
                          </p>
                        </div>

                        {listingHref && (
                          <Link
                            href={listingHref}
                            target="_blank"
                            className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
                          >
                            View public listing →
                          </Link>
                        )}
                      </div>

                      {claim.status === 'pending' && (
                        <div className="flex flex-col gap-3 min-w-[180px]">
                          <button
                            onClick={() => approveClaim(claim)}
                            disabled={actingId === claim.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                          >
                            {actingId === claim.id ? 'Working...' : '✅ Approve'}
                          </button>

                          <button
                            onClick={() => rejectClaim(claim)}
                            disabled={actingId === claim.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                          >
                            {actingId === claim.id ? 'Working...' : '❌ Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}