import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import LocationClient from './LocationClient';

export const revalidate = 600;

type PageProps = {
  params: Promise<{
    city: string;
    street: string;
    location: string;
  }>;
};

const normalizeSlug = (value: string) =>
  value?.toLowerCase().trim().replace(/\s+/g, '-');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function loadIndiaLocation(citySlug: string, streetSlug: string, locationSlug: string) {
  const { data: country, error: countryError } = await supabase
    .from('countries')
    .select('id,name,slug')
    .eq('slug', 'india')
    .maybeSingle();

  if (countryError || !country) return { error: countryError || new Error('India was not found.') };

  const { data: state, error: stateError } = await supabase
    .from('provinces')
    .select('id,name,slug')
    .eq('country_id', country.id)
    .eq('slug', 'gujarat')
    .maybeSingle();

  if (stateError || !state) return { error: stateError || new Error('Gujarat was not found.') };

  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('id,name,slug')
    .eq('province_id', state.id)
    .eq('slug', citySlug)
    .maybeSingle();

  if (cityError || !city) return { error: cityError || new Error('City was not found.') };

  const { data: street, error: streetError } = await supabase
    .from('streets')
    .select('id,name,slug')
    .eq('city_id', city.id)
    .eq('slug', streetSlug)
    .maybeSingle();

  if (streetError || !street) return { error: streetError || new Error('Street was not found.') };

  const { data: location, error: locationError } = await supabase
    .from('street_locations')
    .select('id,name,slug,location_type,full_address,landmark,latitude,longitude')
    .eq('street_id', street.id)
    .eq('city_id', city.id)
    .eq('slug', locationSlug)
    .maybeSingle();

  if (locationError || !location) return { error: locationError || new Error('Location was not found.') };

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id,name,slug,address,description,parking,category,phone,image_url')
    .eq('location_id', location.id)
    .eq('street_id', street.id)
    .eq('city_id', city.id)
    .eq('approved', true)
    .order('name', { ascending: true });

  if (shopsError) return { error: shopsError };

  return { country, state, city, street, location, shops: shops || [] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const citySlug = normalizeSlug(decodeURIComponent(awaitedParams.city || ''));
  const streetSlug = normalizeSlug(decodeURIComponent(awaitedParams.street || ''));
  const locationSlug = normalizeSlug(decodeURIComponent(awaitedParams.location || ''));
  const result = await loadIndiaLocation(citySlug, streetSlug, locationSlug);

  if ('error' in result) {
    return { title: 'Location Not Found | LocalStreetShop India', robots: { index: false, follow: false } };
  }

  const title = `${result.location.name} Businesses in ${result.city.name} | LocalStreetShop`;
  const description = `Explore approved local businesses inside ${result.location.name} on ${result.street.name} in ${result.city.name}, Gujarat.`;
  const url = `https://www.localstreetshop.com/countries/india/gujarat/${result.city.slug}/streets/${result.street.slug}/locations/${result.location.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'LocalStreetShop', type: 'website' },
    robots: { index: false, follow: false },
  };
}

export default async function IndiaLocationPage({ params }: PageProps) {
  const awaitedParams = await params;
  const citySlug = normalizeSlug(decodeURIComponent(awaitedParams.city || ''));
  const streetSlug = normalizeSlug(decodeURIComponent(awaitedParams.street || ''));
  const locationSlug = normalizeSlug(decodeURIComponent(awaitedParams.location || ''));

  if (!citySlug || !streetSlug || !locationSlug) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Invalid location URL</h1>
        </div>
      </main>
    );
  }

  const result = await loadIndiaLocation(citySlug, streetSlug, locationSlug);

  if ('error' in result) {
    console.error(`Unable to load India location: ${citySlug}/${streetSlug}/${locationSlug}`, result.error);
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">LocalStreetShop India</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Location not found</h1>
          <p className="mt-4 leading-7 text-slate-600">This complex, building, mall, or market is not available yet.</p>
        </div>
      </main>
    );
  }

  return (
    <LocationClient
      state={result.state.slug}
      stateName={result.state.name}
      city={result.city.slug}
      cityName={result.city.name}
      street={result.street.slug}
      streetName={result.street.name}
      locationName={result.location.name}
      locationType={result.location.location_type}
      fullAddress={result.location.full_address}
      landmark={result.location.landmark}
      latitude={result.location.latitude}
      longitude={result.location.longitude}
      shops={result.shops}
    />
  );
}
