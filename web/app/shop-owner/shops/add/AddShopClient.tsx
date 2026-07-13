'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type LocationOption = {
  id: string;
  name: string;
};

type StreetOption = LocationOption & {
  slug: string | null;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function AddShopClient() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedShopName, setSubmittedShopName] = useState('');

  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [streets, setStreets] = useState<StreetOption[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCountries = async () => {
      setLoadingLocations(true);

      const { data, error: countriesError } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');

      if (!isMounted) return;

      if (countriesError) {
        setError(`Unable to load countries: ${countriesError.message}`);
        setCountries([]);
      } else {
        setCountries((data || []) as LocationOption[]);
      }

      setLoadingLocations(false);
    };

    fetchCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setProvinces([]);
    setCities([]);
    setStreets([]);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedStreet('');

    if (!selectedCountry) return;

    const fetchProvinces = async () => {
      const { data, error: provincesError } = await supabase
        .from('provinces')
        .select('id, name')
        .eq('country_id', selectedCountry)
        .order('name');

      if (!isMounted) return;

      if (provincesError) {
        setError(`Unable to load provinces: ${provincesError.message}`);
        setProvinces([]);
        return;
      }

      setProvinces((data || []) as LocationOption[]);
    };

    fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, [selectedCountry]);

  useEffect(() => {
    let isMounted = true;

    setCities([]);
    setStreets([]);
    setSelectedCity('');
    setSelectedStreet('');

    if (!selectedProvince) return;

    const fetchCities = async () => {
      const { data, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', selectedProvince)
        .order('name');

      if (!isMounted) return;

      if (citiesError) {
        setError(`Unable to load cities: ${citiesError.message}`);
        setCities([]);
        return;
      }

      setCities((data || []) as LocationOption[]);
    };

    fetchCities();

    return () => {
      isMounted = false;
    };
  }, [selectedProvince]);

  useEffect(() => {
    let isMounted = true;

    setStreets([]);
    setSelectedStreet('');

    if (!selectedCity) return;

    const fetchStreets = async () => {
      const { data, error: streetsError } = await supabase
        .from('streets')
        .select('id, name, slug')
        .eq('city_id', selectedCity)
        .order('name');

      if (!isMounted) return;

      if (streetsError) {
        setError(`Unable to load streets: ${streetsError.message}`);
        setStreets([]);
        return;
      }

      setStreets((data || []) as StreetOption[]);
    };

    fetchStreets();

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setAddressLabel('');
    setDescription('');
    setParking('');
    setSelectedCountry('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedStreet('');
    setProvinces([]);
    setCities([]);
    setStreets([]);
    setError('');
    setSuccess(false);
    setSubmittedShopName('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setError('');

    const cleanName = name.trim();
    const cleanSlug = slugify(slug);
    const cleanAddress = addressLabel.trim();
    const cleanDescription = description.trim();
    const cleanParking = parking.trim();

    if (
      !cleanName ||
      !cleanSlug ||
      !cleanAddress ||
      !selectedCountry ||
      !selectedProvince ||
      !selectedCity ||
      !selectedStreet
    ) {
      setError(
        'Please complete the shop name, URL slug, address, country, province, city, and street.',
      );
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!userData?.user) {
        throw new Error('Please log in before adding a shop.');
      }

      /*
       * Prevent the same owner from accidentally submitting the same
       * business more than once on the same street.
       */
      const { data: existingSubmission, error: duplicateCheckError } =
        await supabase
          .from('shops')
          .select('id, name, address, approved')
          .eq('owner_id', userData.user.id)
          .eq('street_id', selectedStreet)
          .ilike('name', cleanName)
          .ilike('address', cleanAddress)
          .limit(1)
          .maybeSingle();

      if (duplicateCheckError) {
        throw new Error(
          `Unable to check existing submissions: ${duplicateCheckError.message}`,
        );
      }

      if (existingSubmission) {
        if (existingSubmission.approved) {
          throw new Error(
            'This shop has already been submitted and approved. Please manage it from your Shop Owner Dashboard.',
          );
        }

        throw new Error(
          'This shop has already been submitted and is awaiting admin approval. Please do not submit it again.',
        );
      }

      /*
       * A slug may already exist elsewhere because shop names can repeat.
       * Add a short unique suffix only when the requested slug is taken.
       */
      let finalSlug = cleanSlug;

      const { data: existingSlug, error: slugCheckError } = await supabase
        .from('shops')
        .select('id')
        .eq('slug', cleanSlug)
        .limit(1)
        .maybeSingle();

      if (slugCheckError) {
        throw new Error(
          `Unable to verify the shop URL: ${slugCheckError.message}`,
        );
      }

      if (existingSlug) {
        finalSlug = `${cleanSlug}-${crypto.randomUUID().slice(0, 8)}`;
      }

      const { error: insertError } = await supabase.from('shops').insert([
        {
          name: cleanName,
          slug: finalSlug,
          street_id: selectedStreet,
          city_id: selectedCity,
          province_id: selectedProvince,
          address: cleanAddress,
          description: cleanDescription || null,
          parking: cleanParking || null,
          owner_id: userData.user.id,
          approved: false,
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSubmittedShopName(cleanName);
      setSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err: unknown) {
      console.error('Add shop error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting your shop.',
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <section className="overflow-hidden rounded-[2rem] border border-green-200 bg-white shadow-xl shadow-slate-200">
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 px-6 py-10 text-center text-white sm:px-10">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl"
                aria-hidden="true"
              >
                ✓
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-green-100">
                Submission received
              </p>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Your shop was submitted successfully
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-green-50 sm:text-lg">
                <strong>{submittedShopName}</strong> has been sent to the
                LocalStreetShop admin team for review.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-lg font-extrabold text-blue-950">
                  What happens next?
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-blue-900">
                  <p>
                    <strong>1.</strong> LocalStreetShop will review the shop
                    information you submitted.
                  </p>

                  <p>
                    <strong>2.</strong> Your shop will remain hidden from public
                    city, street, and shop pages while approval is pending.
                  </p>

                  <p>
                    <strong>3.</strong> Once approved, the shop will appear
                    publicly and become available in your Shop Owner Dashboard.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                Please do not submit the same shop again while it is awaiting
                approval. Duplicate submissions may delay the review process.
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop-owner/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Return to Dashboard
                </Link>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Submit Another Shop
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/shop-owner/dashboard"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Dashboard
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Setup
          </p>

          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Add a new shop
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            Add your business to LocalStreetShop. Every new shop submission
            requires admin review before it appears publicly.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700"
            >
              <p className="font-extrabold">Shop not submitted</p>
              <p className="mt-1 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="shop-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Shop Name
                </label>

                <input
                  id="shop-name"
                  type="text"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g. Joe's Coffee"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="shop-slug"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Shop URL Slug
                </label>

                <input
                  id="shop-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(slugify(event.target.value))
                  }
                  required
                  disabled={loading}
                  placeholder="joes-coffee"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This creates the shop&apos;s LocalStreetShop web address.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="shop-address"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Full Address
              </label>

              <input
                id="shop-address"
                type="text"
                value={addressLabel}
                onChange={(event) => setAddressLabel(event.target.value)}
                required
                disabled={loading}
                placeholder="e.g. 123 Queen St E, Toronto"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="shop-country"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Country
                </label>

                <select
                  id="shop-country"
                  value={selectedCountry}
                  onChange={(event) =>
                    setSelectedCountry(event.target.value)
                  }
                  required
                  disabled={loading || loadingLocations}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {loadingLocations
                      ? 'Loading countries...'
                      : 'Select Country'}
                  </option>

                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shop-province"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Province
                </label>

                <select
                  id="shop-province"
                  value={selectedProvince}
                  onChange={(event) =>
                    setSelectedProvince(event.target.value)
                  }
                  required
                  disabled={loading || !selectedCountry}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">Select Province</option>

                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shop-city"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  City
                </label>

                <select
                  id="shop-city"
                  value={selectedCity}
                  onChange={(event) =>
                    setSelectedCity(event.target.value)
                  }
                  required
                  disabled={loading || !selectedProvince}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">Select City</option>

                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shop-street"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Street
                </label>

                <select
                  id="shop-street"
                  value={selectedStreet}
                  onChange={(event) =>
                    setSelectedStreet(event.target.value)
                  }
                  required
                  disabled={loading || !selectedCity}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">Select Street</option>

                  {streets.map((street) => (
                    <option key={street.id} value={street.id}>
                      {street.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="shop-description"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Description{' '}
                <span className="font-medium text-slate-500">(optional)</span>
              </label>

              <textarea
                id="shop-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                disabled={loading}
                placeholder="Tell customers what your shop offers..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="shop-parking"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Parking Information{' '}
                <span className="font-medium text-slate-500">(optional)</span>
              </label>

              <input
                id="shop-parking"
                type="text"
                value={parking}
                onChange={(event) => setParking(event.target.value)}
                disabled={loading}
                placeholder="Street parking, plaza parking, paid parking nearby..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="font-extrabold text-blue-950">
                Admin approval required
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-blue-800">
                After submission, your shop will be sent to LocalStreetShop for
                review. It will not appear publicly until an admin approves it.
                If the business is already listed, please use the Claim Shop
                page instead.
              </p>

              <Link
                href="/shop-owner/claim"
                className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
              >
                Claim an existing shop →
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || loadingLocations}
              className="w-full rounded-full bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? 'Submitting Shop...' : 'Submit Shop for Approval'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}