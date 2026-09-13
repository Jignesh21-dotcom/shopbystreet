import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

export const revalidate = 600;

type Props = { params: Promise<{ state: string }> };
const normalize = (value: string) => decodeURIComponent(value || '').toLowerCase().trim().replace(/\s+/g, '-');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function loadState(stateSlug: string) {
  const { data: country } = await supabase.from('countries').select('id').eq('slug', 'india').maybeSingle();
  if (!country) return null;
  const { data: state } = await supabase.from('provinces').select('id,name,slug').eq('country_id', country.id).eq('slug', stateSlug).maybeSingle();
  if (!state) return null;
  const { data: cities } = await supabase.from('cities').select('id,name,slug').eq('province_id', state.id).order('name');
  return { state, cities: cities || [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const result = await loadState(normalize(state));
  return { title: result ? `Explore ${result.state.name} | LocalStreetShop India` : 'State Not Found | LocalStreetShop India' };
}

export default async function IndiaStatePage({ params }: Props) {
  const { state } = await params;
  const result = await loadState(normalize(state));
  if (!result) return <main className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-8"><h1 className="text-3xl font-black">State not found</h1></div></main>;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/countries/india" className="font-bold text-orange-700">← India</Link>
        <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-orange-600 to-green-700 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">LocalStreetShop India</p>
          <h1 className="mt-3 text-4xl font-black">Explore {result.state.name}</h1>
          <p className="mt-4 max-w-3xl text-white/90">Browse cities, markets, streets and local businesses as this state grows on LocalStreetShop.</p>
        </section>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.cities.length ? result.cities.map((city) => (
            <Link key={city.id} href={`/countries/india/${result.state.slug}/${city.slug}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-2xl font-black text-slate-950">{city.name}</h2>
              <p className="mt-2 text-slate-600">Explore local streets and businesses →</p>
            </Link>
          )) : <div className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">No public cities yet. New cities are added automatically as verified businesses are approved.</div>}
        </section>
      </div>
    </main>
  );
}
