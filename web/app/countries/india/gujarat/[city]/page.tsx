import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import IndiaCityClient from './IndiaCityClient';

export const revalidate = 600;

type PageProps = {
  params: Promise<{
    city: string;
  }>;
};

type StreetRow = {
  id: string;
  name: string;
  slug: string;
  display_name?: string | null;
};

const normalizeSlug = (value: string) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function loadGujaratCity(citySlug: string) {
  const { data: country, error: countryError } = await supabase
    .from('countries')
    .select('id, name, slug')
    .eq('slug', 'india')
    .maybeSingle();

  if (countryError || !country) {
    return { error: countryError || new Error('India was not found.') };
  }

  const { data: state, error: stateError } = await supabase
    .from('provinces')
    .select('id, name, slug')
    .eq('country_id', country.id)
    .eq('slug', 'gujarat')
    .maybeSingle();

  if (stateError || !state) {
    return { error: stateError || new Error('Gujarat was not found.') };
  }

  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('province_id', state.id)
    .eq('slug', citySlug)
    .maybeSingle();

  if (cityError || !city) {
    return { error: cityError || new Error('City was not found.') };
  }

  const { data: streets, error: streetsError } = await supabase
    .from('streets')
    .select('id, name, slug, display_name')
    .eq('city_id', city.id)
    .order('name', { ascending: true });

  if (streetsError) {
    return { error: streetsError };
  }

  const streetRows = (streets || []) as StreetRow[];
  const streetIds = streetRows.map((street) => street.id);

  let shopCounts: Record<string, number> = {};

  if (streetIds.length > 0) {
    const { data: approvedShops, error: shopsError } = await supabase
      .from('shops')
      .select('street_id')
      .eq('city_id', city.id)
      .eq('approved', true)
      .in('street_id', streetIds);

    if (shopsError) {
      return { error: shopsError };
    }

    shopCounts = (approvedShops || []).reduce(
      (counts: Record<string, number>, shop: { street_id: string | null }) => {
        if (shop.street_id) {
          counts[shop.street_id] = (counts[shop.street_id] || 0) + 1;
        }

        return counts;
      },
      {}
    );
  }

  return {
    country,
    state,
    city,
    streets: streetRows.map((street) => ({
      id: street.id,
      name: street.display_name || street.name,
      slug: street.slug,
      shopCount: shopCounts[street.id] || 0,
    })),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const citySlug = normalizeSlug(decodeURIComponent(awaitedParams.city || ''));
  const result = await loadGujaratCity(citySlug);

  if ('error' in result) {
    return {
      title: 'City Not Found | LocalStreetShop India',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `Explore ${result.city.name} | LocalStreetShop Gujarat`;
  const description = `Explore ${result.city.name}'s local shopping streets, markets, areas, and independent businesses with LocalStreetShop.`;
  const url = `https://www.localstreetshop.com/countries/india/gujarat/${result.city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'LocalStreetShop',
      type: 'website',
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function IndiaCityPage({ params }: PageProps) {
  const awaitedParams = await params;
  const citySlug = normalizeSlug(decodeURIComponent(awaitedParams.city || ''));

  if (!citySlug) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">
            Invalid city URL
          </h1>
        </div>
      </main>
    );
  }

  const result = await loadGujaratCity(citySlug);

  if ('error' in result) {
    console.error(`Unable to load Gujarat city: ${citySlug}`, result.error);

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
            LocalStreetShop Gujarat
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">
            City not found
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            This city has not been added to the Gujarat directory yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <IndiaCityClient
      state={result.state.slug}
      stateName={result.state.name}
      city={result.city.slug}
      cityName={result.city.name}
      streets={result.streets}
    />
  );
}