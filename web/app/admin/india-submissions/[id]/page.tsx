'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Submission = Record<string, any>;
type ExistingLocation = {
  id: string;
  name: string;
  slug: string;
  location_type: string;
  full_address?: string | null;
  landmark?: string | null;
};

type MatchItem = {
  status: 'matched' | 'will_create' | 'missing' | 'independent';
  record?: Record<string, any> | null;
  proposedSlug?: string;
};

type MatchPreview = {
  country: MatchItem;
  state: MatchItem;
  city: MatchItem;
  street: MatchItem;
  location: MatchItem;
  existingLocations: ExistingLocation[];
  possibleDuplicateShops: Array<Record<string, any>>;
};

const locationTypes = [
  ['complex', 'Complex'],
  ['building', 'Building'],
  ['mall', 'Mall'],
  ['market', 'Market'],
  ['bazaar', 'Bazaar'],
  ['plaza', 'Plaza'],
  ['village_centre', 'Village centre'],
  ['commercial_area', 'Commercial area'],
  ['independent', 'Independent shop'],
  ['other', 'Other'],
] as const;

const statusStyles: Record<MatchItem['status'], string> = {
  matched: 'border-green-200 bg-green-50 text-green-900',
  will_create: 'border-orange-200 bg-orange-50 text-orange-950',
  missing: 'border-red-200 bg-red-50 text-red-900',
  independent: 'border-slate-200 bg-slate-50 text-slate-800',
};

const statusLabel: Record<MatchItem['status'], string> = {
  matched: 'Existing record will be reused',
  will_create: 'New record will be created',
  missing: 'Required record is missing',
  independent: 'No complex or building',
};

export default function IndiaSubmissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [preview, setPreview] = useState<MatchPreview | null>(null);
  const [notes, setNotes] = useState('');
  const [streetName, setStreetName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('complex');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: admin } = await supabase.rpc('is_admin');
      if (!admin) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('india_business_submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      setSubmission(data);
      setNotes(data?.admin_notes || '');
      // India browsing is area-first. Prefer an existing locality such as Alkapuri
      // over creating a separate road card such as R.C. Dutt Road.
      setStreetName(data?.locality || data?.street_or_market || '');
      setLocationName(data?.building_name || '');
      setLocationType(data?.building_name ? 'complex' : 'independent');
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!submission || !streetName.trim()) {
      setPreview(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError('');
      const { data } = await supabase.auth.getSession();

      try {
        const response = await fetch(`/api/india/business-submissions/${id}/matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ streetName, locationName }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to preview matches.');

        setPreview(result);
        setDuplicateConfirmed(false);

        if (result.location?.status === 'matched' && result.location.record?.id) {
          setSelectedLocationId(result.location.record.id);
          setLocationType(result.location.record.location_type || locationType);
        } else if (
          selectedLocationId &&
          !(result.existingLocations || []).some((location: ExistingLocation) => location.id === selectedLocationId)
        ) {
          setSelectedLocationId('');
        }
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : 'Unable to preview matches.');
      } finally {
        setPreviewLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [id, submission, streetName, locationName]);

  const existingLocations = preview?.existingLocations || [];
  const selectedLocation = useMemo(
    () => existingLocations.find((location) => location.id === selectedLocationId),
    [existingLocations, selectedLocationId],
  );

  const duplicates = preview?.possibleDuplicateShops || [];
  const approvalBlocked = duplicates.length > 0 && !duplicateConfirmed;

  const act = async (kind: 'approve' | 'reject') => {
    if (!submission) return;
    if (kind === 'approve' && approvalBlocked) {
      alert('Review the possible duplicate warning and confirm before approving.');
      return;
    }
    if (!confirm(`${kind === 'approve' ? 'Approve' : 'Reject'} ${submission.business_name}?`)) return;

    setActing(true);
    const { data } = await supabase.auth.getSession();
    const response = await fetch(`/api/india/business-submissions/${id}/${kind}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        adminNotes: notes,
        streetName,
        locationName: selectedLocation?.name || locationName,
        locationType: selectedLocation?.location_type || locationType,
        existingLocationId: selectedLocationId || null,
      }),
    });

    const result = await response.json();
    setActing(false);

    if (!response.ok) {
      alert(result.error || 'Action failed');
      return;
    }

    alert(kind === 'approve'
      ? 'City, street, location and shop were processed successfully.'
      : 'Submission rejected.');
    router.push('/admin/india-submissions');
    router.refresh();
  };

  if (loading) return <main className="p-10">Loading...</main>;
  if (!submission) return <main className="p-10">Submission not found or access denied.</main>;

  const fields = [
    ['Business', submission.business_name],
    ['Category', submission.category],
    ['Owner/contact', submission.owner_name],
    ['Email', submission.email],
    ['Phone', submission.phone],
    ['WhatsApp', submission.whatsapp],
    ['Shop/unit', submission.shop_number],
    ['Floor', submission.floor],
    ['Building', submission.building_name],
    ['Landmark', submission.landmark],
    ['Submitted street/road', submission.street_or_market],
    ['Locality', submission.locality],
    ['Village/town', submission.village_town],
    ['City', submission.city_name],
    ['District', submission.district],
    ['State', submission.state_name],
    ['PIN', submission.pin_code],
    ['Full address', submission.full_address],
    ['Google Maps', submission.google_maps_url],
  ];

  const matchCards: Array<[string, MatchItem | undefined]> = [
    ['Country', preview?.country],
    ['State', preview?.state],
    ['City', preview?.city],
    ['Street', preview?.street],
    ['Complex / location', preview?.location],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/india-submissions" className="font-bold text-blue-700">
          ← Back to submissions
        </Link>

        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-700">Admin review</p>
          <h1 className="mt-2 text-4xl font-black">{submission.business_name}</h1>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {fields.map(([label, value]) => value ? (
              <div key={label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                <p className="mt-1 whitespace-pre-wrap font-semibold text-slate-900">{String(value)}</p>
              </div>
            ) : null)}
          </div>

          <div className="mt-7 grid gap-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 md:grid-cols-2">
            <div>
              <label className="font-black text-orange-950">Final street / road / market</label>
              <input
                value={streetName}
                onChange={(event) => setStreetName(event.target.value)}
                className="mt-3 w-full rounded-xl border border-orange-200 px-4 py-3"
                placeholder="Arunachal Road"
              />
              <p className="mt-2 text-sm text-orange-800">The system will reuse an exact street or create it.</p>
            </div>

            <div>
              <label className="font-black text-orange-950">Building / complex / mall / local stop</label>
              <input
                value={locationName}
                onChange={(event) => {
                  setSelectedLocationId('');
                  setLocationName(event.target.value);
                }}
                className="mt-3 w-full rounded-xl border border-orange-200 px-4 py-3"
                placeholder="Astha Complex"
              />
              <p className="mt-2 text-sm text-orange-800">An exact matching location is selected automatically.</p>
            </div>

            <div>
              <label className="font-black text-orange-950">Location type</label>
              <select
                value={locationType}
                onChange={(event) => setLocationType(event.target.value)}
                className="mt-3 w-full rounded-xl border border-orange-200 px-4 py-3"
              >
                {locationTypes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-black text-orange-950">Reuse an existing stop</label>
              <select
                value={selectedLocationId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedLocationId(nextId);
                  const next = existingLocations.find((location) => location.id === nextId);
                  if (next) {
                    setLocationName(next.name);
                    setLocationType(next.location_type);
                  }
                }}
                className="mt-3 w-full rounded-xl border border-orange-200 px-4 py-3"
              >
                <option value="">Create or match by entered name</option>
                {existingLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.location_type.replaceAll('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Intelligent approval preview</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">What will happen after approval</h2>
              </div>
              {previewLoading && <span className="text-sm font-bold text-orange-700">Checking…</span>}
            </div>

            {previewError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">{previewError}</p>
            )}

            {preview && (
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {matchCards.map(([label, item]) => item ? (
                  <div key={label} className={`rounded-2xl border p-4 ${statusStyles[item.status]}`}>
                    <p className="text-xs font-black uppercase tracking-wider">{label}</p>
                    <p className="mt-2 text-lg font-black">
                      {item.record?.name || item.proposedSlug || (item.status === 'independent' ? 'Independent shop' : 'Not found')}
                    </p>
                    <p className="mt-1 text-sm font-semibold opacity-80">{statusLabel[item.status]}</p>
                  </div>
                ) : null)}
              </div>
            )}
          </section>

          {duplicates.length > 0 && (
            <section className="mt-7 rounded-3xl border-2 border-red-300 bg-red-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Possible duplicate warning</p>
              <h2 className="mt-2 text-2xl font-black text-red-950">Review before creating another shop</h2>
              <div className="mt-4 space-y-3">
                {duplicates.map((shop) => (
                  <div key={shop.id} className="rounded-2xl border border-red-200 bg-white p-4">
                    <p className="font-black text-slate-950">{shop.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{shop.phone || 'No phone'} · {shop.address || 'No address'}</p>
                  </div>
                ))}
              </div>
              <label className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 font-semibold text-red-950">
                <input
                  type="checkbox"
                  checked={duplicateConfirmed}
                  onChange={(event) => setDuplicateConfirmed(event.target.checked)}
                  className="mt-1 h-5 w-5"
                />
                I reviewed these records and this submission should still be approved as a separate business.
              </label>
            </section>
          )}

          <div className="mt-5">
            <label className="font-black">Admin notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => act('approve')}
              disabled={acting || previewLoading || approvalBlocked}
              className="rounded-full bg-green-700 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {acting ? 'Working...' : 'Approve and publish'}
            </button>
            <button
              onClick={() => act('reject')}
              disabled={acting}
              className="rounded-full bg-red-700 px-6 py-3 font-black text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
