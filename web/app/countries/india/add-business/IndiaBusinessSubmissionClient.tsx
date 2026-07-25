'use client';

import {
  FormEvent,
  useState,
  type ChangeEvent,
} from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const initialForm = {
  businessName: '',
  category: '',
  description: '',
  ownerName: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  instagram: '',
  shopNumber: '',
  floor: '',
  buildingName: '',
  landmark: '',
  streetOrMarket: '',
  locality: '',
  villageTown: '',
  cityName: '',
  district: '',
  stateName: 'Gujarat',
  pinCode: '',
  fullAddress: '',
  googleMapsUrl: '',
  latitude: '',
  longitude: '',
  parking: '',
};

type FormState = typeof initialForm;
type FormFieldKey = keyof FormState;

type FieldProps = {
  id: FormFieldKey;
  label: string;
  value: string;
  onChange: (
    key: FormFieldKey,
    value: string,
  ) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
};

function FormField({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  type = 'text',
  disabled = false,
  autoComplete,
}: FieldProps) {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(id, event.target.value);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
        {required ? ' *' : ''}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}

export default function IndiaBusinessSubmissionClient() {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (
    key: FormFieldKey,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError('');

    if (
      !form.businessName.trim() ||
      !form.streetOrMarket.trim() ||
      !form.cityName.trim() ||
      !form.stateName.trim() ||
      !form.fullAddress.trim()
    ) {
      setError(
        'Please complete the business name, street/market/location, city or town, state, and full address.',
      );
      return;
    }

    if (
      !form.email.trim() &&
      !form.phone.trim() &&
      !form.whatsapp.trim()
    ) {
      setError(
        'Please provide at least one contact method: email, phone, or WhatsApp.',
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const token = data.session?.access_token;

      if (!token) {
        throw new Error(
          'Please sign in before submitting your business.',
        );
      }

      const response = await fetch(
        '/api/india/business-submissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to submit the business.',
        );
      }

      setSuccess(true);
      setForm(initialForm);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to submit the business.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-orange-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-green-200 bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">✅</div>

          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Submission received
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            We will verify the business and its location.
            After approval, the location and shop will be
            added to LocalStreetShop together.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/countries/india"
              className="rounded-full bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              Back to India
            </Link>

            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Submit another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/countries/india"
          className="font-bold text-orange-700 hover:underline"
        >
          ← Back to India
        </Link>

        <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-orange-600 to-green-700 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-100">
            India business submission
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Add your business and location
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Indian addresses can include roads, markets,
            buildings, landmarks, localities, villages and
            floors. Submit the complete address naturally;
            our admin will verify and organize it before
            publishing.
          </p>
        </section>

        <form
          onSubmit={submit}
          className="mt-8 space-y-7"
        >
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700"
            >
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">
              1. Business details
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <FormField
                id="businessName"
                label="Business name"
                required
                placeholder="e.g. Bal Gopal"
                value={form.businessName}
                onChange={update}
                disabled={loading}
                autoComplete="organization"
              />

              <FormField
                id="category"
                label="Category"
                placeholder="e.g. Clothing, Grocery, Jewellery"
                value={form.category}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="ownerName"
                label="Owner or contact name"
                value={form.ownerName}
                onChange={update}
                disabled={loading}
                autoComplete="name"
              />

              <FormField
                id="website"
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={update}
                disabled={loading}
                autoComplete="url"
              />

              <FormField
                id="instagram"
                label="Instagram"
                placeholder="@businessname"
                value={form.instagram}
                onChange={update}
                disabled={loading}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Business description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(event) =>
                  update(
                    'description',
                    event.target.value,
                  )
                }
                rows={4}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">
              2. Contact information
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Provide at least one contact method.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <FormField
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={update}
                disabled={loading}
                autoComplete="email"
              />

              <FormField
                id="phone"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={update}
                disabled={loading}
                autoComplete="tel"
              />

              <FormField
                id="whatsapp"
                label="WhatsApp"
                type="tel"
                value={form.whatsapp}
                onChange={update}
                disabled={loading}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">
              3. Complete Indian address
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <FormField
                id="shopNumber"
                label="Shop or unit number"
                placeholder="Shop 12"
                value={form.shopNumber}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="floor"
                label="Floor"
                placeholder="Second floor"
                value={form.floor}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="buildingName"
                label="Building or complex"
                placeholder="Shreeji Complex"
                value={form.buildingName}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="landmark"
                label="Landmark"
                placeholder="Opposite railway station"
                value={form.landmark}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="streetOrMarket"
                label="Street, road, market, building, or village centre"
                required
                placeholder="R.C. Dutt Road / Mangal Bazaar"
                value={form.streetOrMarket}
                onChange={update}
                disabled={loading}
                autoComplete="address-line1"
              />

              <FormField
                id="locality"
                label="Locality or area"
                placeholder="Alkapuri"
                value={form.locality}
                onChange={update}
                disabled={loading}
                autoComplete="address-line2"
              />

              <FormField
                id="villageTown"
                label="Village or town"
                value={form.villageTown}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="cityName"
                label="City / municipality"
                required
                placeholder="Vadodara"
                value={form.cityName}
                onChange={update}
                disabled={loading}
                autoComplete="address-level2"
              />

              <FormField
                id="district"
                label="District"
                placeholder="Vadodara District"
                value={form.district}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="stateName"
                label="State"
                required
                value={form.stateName}
                onChange={update}
                disabled={loading}
                autoComplete="address-level1"
              />

              <FormField
                id="pinCode"
                label="PIN code"
                placeholder="390007"
                value={form.pinCode}
                onChange={update}
                disabled={loading}
                autoComplete="postal-code"
              />

              <FormField
                id="googleMapsUrl"
                label="Google Maps link"
                type="url"
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl}
                onChange={update}
                disabled={loading}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="fullAddress"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Full address *
              </label>

              <textarea
                id="fullAddress"
                name="fullAddress"
                required
                value={form.fullAddress}
                onChange={(event) =>
                  update(
                    'fullAddress',
                    event.target.value,
                  )
                }
                rows={5}
                disabled={loading}
                placeholder="Write the address exactly as local customers would understand it."
                autoComplete="street-address"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">
              4. Optional location details
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <FormField
                id="latitude"
                label="Latitude"
                inputMode="decimal"
                value={form.latitude}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="longitude"
                label="Longitude"
                inputMode="decimal"
                value={form.longitude}
                onChange={update}
                disabled={loading}
              />

              <FormField
                id="parking"
                label="Parking information"
                value={form.parking}
                onChange={update}
                disabled={loading}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-7 py-4 text-lg font-black text-white shadow-lg transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Submitting...'
              : 'Submit business for verification'}
          </button>
        </form>
      </div>
    </main>
  );
}