'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Option = { id: string; name: string };
type ProvinceOption = Option & { country_id: string | null };
type ShopRecord = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  description: string | null;
  parking: string | null;
  province_id: string | null;
  city_id: string | null;
  street_id: string | null;
  approved: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function ReviewShopPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const shopId = params.id;

  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [indiaCountryId, setIndiaCountryId] = useState('');
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [streets, setStreets] = useState<Option[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [cityName, setCityName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId) || null,
    [provinces, provinceId],
  );

  const isIndia = Boolean(
    indiaCountryId && selectedProvince?.country_id === indiaCountryId,
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      if (adminError || !isAdmin) {
        if (active) {
          setError('Administrator access required.');
          setLoading(false);
        }
        return;
      }

      const [shopResult, provinceResult, indiaResult] = await Promise.all([
        supabase
          .from('shops')
          .select('id, name, slug, address, description, parking, province_id, city_id, street_id, approved')
          .eq('id', shopId)
          .maybeSingle(),
        supabase
          .from('provinces')
          .select('id, name, country_id')
          .order('name'),
        supabase
          .from('countries')
          .select('id')
          .eq('slug', 'india')
          .maybeSingle(),
      ]);

      if (!active) return;
      if (shopResult.error || !shopResult.data) {
        setError(shopResult.error?.message || 'Shop not found.');
        setLoading(false);
        return;
      }

      const record = shopResult.data as ShopRecord;
      const indiaId = indiaResult.data?.id || '';

      setShop(record);
      setName(record.name);
      setSlug(record.slug || '');
      setAddress(record.address || '');
      setDescription(record.description || '');
      setParking(record.parking || '');
      setProvinceId(record.province_id || '');
      setCityId(record.city_id || '');
      setStreetId(record.street_id || '');
      setProvinces((provinceResult.data || []) as ProvinceOption[]);
      setIndiaCountryId(indiaId);

      // Pre-fill the manual India fields from the shop's current assignments
      // when those records exist. They can then be corrected freely by admin.
      const lookupTasks: PromiseLike<any>[] = [];
      if (record.city_id) {
        lookupTasks.push(
          supabase
            .from('cities')
            .select('name')
            .eq('id', record.city_id)
            .maybeSingle(),
        );
      } else {
        lookupTasks.push(Promise.resolve({ data: null }));
      }
      if (record.street_id) {
        lookupTasks.push(
          supabase
            .from('streets')
            .select('name')
            .eq('id', record.street_id)
            .maybeSingle(),
        );
      } else {
        lookupTasks.push(Promise.resolve({ data: null }));
      }

      const [cityLookup, streetLookup] = await Promise.all(lookupTasks);
      if (!active) return;
      setCityName(cityLookup?.data?.name || '');
      setStreetName(streetLookup?.data?.name || '');
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [router, shopId]);

  useEffect(() => {
    let active = true;

    if (!provinceId || isIndia) {
      setCities([]);
      return;
    }

    supabase
      .from('cities')
      .select('id, name')
      .eq('province_id', provinceId)
      .order('name')
      .then(({ data, error: cityError }) => {
        if (!active) return;
        if (cityError) setError(cityError.message);
        else setCities((data || []) as Option[]);
      });

    return () => {
      active = false;
    };
  }, [provinceId, isIndia]);

  useEffect(() => {
    let active = true;

    if (!cityId || isIndia) {
      setStreets([]);
      return;
    }

    supabase
      .from('streets')
      .select('id, name')
      .eq('city_id', cityId)
      .order('name')
      .then(({ data, error: streetError }) => {
        if (!active) return;
        if (streetError) setError(streetError.message);
        else setStreets((data || []) as Option[]);
      });

    return () => {
      active = false;
    };
  }, [cityId, isIndia]);

  const handleProvinceChange = (nextProvinceId: string) => {
    setProvinceId(nextProvinceId);
    setCityId('');
    setStreetId('');
    setCityName('');
    setStreetName('');
    setSuccess('');
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (isIndia && (!cityName.trim() || !streetName.trim())) {
      setError('For India, enter the city / municipality and public listing street / market.');
      setSaving(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError('Your admin session has expired. Please log in again.');
      setSaving(false);
      return;
    }

    const response = await fetch(`/api/admin/shops/${shopId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        slug,
        address,
        description,
        parking,
        provinceId,
        cityId: isIndia ? '' : cityId,
        streetId: isIndia ? '' : streetId,
        cityName: isIndia ? cityName : '',
        streetName: isIndia ? streetName : '',
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setError(result?.error || 'Unable to save the shop.');
    } else {
      setSlug(slugify(slug || name));
      if (result?.cityId) setCityId(result.cityId);
      if (result?.streetId) setStreetId(result.streetId);
      setSuccess(
        result?.createdCity || result?.createdStreet
          ? `Shop details saved.${result.createdCity ? ' City created.' : ''}${result.createdStreet ? ' Street / market created.' : ''} You can now return to the review list and approve it.`
          : 'Shop details saved. You can now return to the review list and approve it.',
      );
    }
    setSaving(false);
  };

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-10 text-center text-slate-600">Loading shop...</main>;
  }

  if (!shop) {
    return <main className="min-h-screen bg-slate-50 p-10 text-center text-red-700">{error || 'Shop not found.'}</main>;
  }

  const fieldClass =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/shops" className="text-sm font-bold text-blue-700 hover:text-blue-900">
          ← Back to Pending Shops
        </Link>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Admin Review</p>
          <h1 className="mt-3 text-3xl font-extrabold">Review &amp; edit shop</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Verify the official postal address and assign the shop to the street where it should appear publicly. Entrance and parking directions remain separate.
          </p>

          {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
          {success && <div role="status" className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">{success}</div>}

          <form onSubmit={save} className="mt-7 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Business Name
                <input value={name} onChange={(event) => setName(event.target.value)} required className={fieldClass} />
              </label>
              <label className="text-sm font-bold text-slate-700">Shop URL Slug
                <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required className={fieldClass} />
              </label>
            </div>

            <label className="block text-sm font-bold text-slate-700">Official Full Business Address
              <input value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="Unit, street number and name, city, province/state, postal code" className={fieldClass} />
              <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">Use the postal address here, even if customers enter from another street.</span>
            </label>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="text-sm font-bold text-slate-700">
                {isIndia ? 'State / Union Territory' : 'Province'}
                <select value={provinceId} onChange={(event) => handleProvinceChange(event.target.value)} required className={fieldClass}>
                  <option value="">{isIndia ? 'Select state / UT' : 'Select province / state'}</option>
                  {provinces.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </label>

              {isIndia ? (
                <label className="text-sm font-bold text-slate-700">City / Municipality
                  <input
                    value={cityName}
                    onChange={(event) => setCityName(event.target.value)}
                    required
                    placeholder="e.g. New Delhi"
                    className={fieldClass}
                  />
                  <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">
                    If it does not exist yet, saving will create it automatically.
                  </span>
                </label>
              ) : (
                <label className="text-sm font-bold text-slate-700">City
                  <select value={cityId} onChange={(event) => { setCityId(event.target.value); setStreetId(''); }} required disabled={!provinceId} className={fieldClass}>
                    <option value="">Select city</option>
                    {cities.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
              )}

              {isIndia ? (
                <label className="text-sm font-bold text-slate-700">Public Listing Street / Market
                  <input
                    value={streetName}
                    onChange={(event) => setStreetName(event.target.value)}
                    required
                    placeholder="e.g. Kirti Nagar"
                    className={fieldClass}
                  />
                  <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">
                    Existing streets are reused; otherwise a new one is created.
                  </span>
                </label>
              ) : (
                <label className="text-sm font-bold text-slate-700">Public Listing Street
                  <select value={streetId} onChange={(event) => setStreetId(event.target.value)} required disabled={!cityId} className={fieldClass}>
                    <option value="">Select street</option>
                    {streets.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
              )}
            </div>

            {isIndia && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900">
                <strong>India automatic location mode:</strong> enter the correct city and street / market. When you save, LocalStreetShop will reuse matching records or create them under the selected State / Union Territory.
              </div>
            )}

            <label className="block text-sm font-bold text-slate-700">Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} className={fieldClass} />
            </label>
            <label className="block text-sm font-bold text-slate-700">Entrance, Access &amp; Parking
              <textarea value={parking} onChange={(event) => setParking(event.target.value)} rows={3} placeholder="Alternate entrance street, unit access, and parking directions" className={fieldClass} />
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={saving} className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Review Changes'}
              </button>
              <Link href="/admin/shops" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
