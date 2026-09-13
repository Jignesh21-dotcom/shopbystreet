import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import IndiaStreetClient from './IndiaStreetClient';

export const revalidate = 300;

type Props = {
  params: Promise<{ state: string; city: string; street: string }>;
};

const norm = (value: string) =>
  decodeURIComponent(value || '').toLowerCase().trim().replace(/\s+/g, '-');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export default async function IndiaStreetPage({ params }: Props) {
  const p = await params;
  const stateSlug = norm(p.state);
  const citySlug = norm(p.city);
  const streetSlug = norm(p.street);

  const { data: country } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', 'india')
    .maybeSingle();

  const { data: state } = country
    ? await supabase
        .from('provinces')
        .select('id,name,slug')
        .eq('country_id', country.id)
        .eq('slug', stateSlug)
        .maybeSingle()
    : { data: null };

  const { data: city } = state
    ? await supabase
        .from('cities')
        .select('id,name,slug')
        .eq('province_id', state.id)
        .eq('slug', citySlug)
        .maybeSingle()
    : { data: null };

  const { data: street } = city
    ? await supabase
        .from('streets')
        .select('id,name,display_name,slug')
        .eq('city_id', city.id)
        .eq('slug', streetSlug)
        .maybeSingle()
    : { data: null };

  if (!state || !city || !street) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8">
          <h1 className="text-3xl font-black">Street not found</h1>
          <Link href={`/countries/india/${stateSlug}/${citySlug}`} className="mt-5 inline-block font-bold text-orange-700">
            ← Back to city
          </Link>
        </div>
      </main>
    );
  }

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id,name,slug,description,address,parking,image_url,category,phone,street_number')
    .eq('street_id', street.id)
    .eq('city_id', city.id)
    .eq('approved', true);

  if (shopsError) {
    console.error('Unable to load India street shops:', shopsError);
  }

  return (
    <IndiaStreetClient
      state={state.slug}
      stateName={state.name}
      city={city.slug}
      cityName={city.name}
      street={street.slug}
      streetName={street.display_name || street.name}
      shops={shops || []}
    />
  );
}
