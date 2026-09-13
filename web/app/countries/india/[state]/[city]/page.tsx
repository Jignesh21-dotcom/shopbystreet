import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 600;
type Props = { params: Promise<{ state: string; city: string }> };
const norm = (v: string) => decodeURIComponent(v || '').toLowerCase().trim().replace(/\s+/g, '-');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession:false, autoRefreshToken:false } });

export default async function IndiaCityPage({ params }: Props) {
  const p = await params; const stateSlug=norm(p.state); const citySlug=norm(p.city);
  const { data: country } = await supabase.from('countries').select('id').eq('slug','india').maybeSingle();
  const { data: state } = country ? await supabase.from('provinces').select('id,name,slug').eq('country_id',country.id).eq('slug',stateSlug).maybeSingle() : {data:null};
  const { data: city } = state ? await supabase.from('cities').select('id,name,slug').eq('province_id',state.id).eq('slug',citySlug).maybeSingle() : {data:null};
  if (!state || !city) return <main className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-8"><h1 className="text-3xl font-black">City not found</h1></div></main>;
  const { data: streets } = await supabase.from('streets').select('id,name,display_name,slug').eq('city_id',city.id).order('name');
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-6xl">
    <Link href={`/countries/india/${state.slug}`} className="font-bold text-orange-700">← {state.name}</Link>
    <section className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm"><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">{state.name}, India</p><h1 className="mt-3 text-4xl font-black">Explore {city.name}</h1><p className="mt-3 text-slate-600">Choose a street, market or local shopping area.</p></section>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(streets||[]).map((street)=><Link key={street.id} href={`/countries/india/${state.slug}/${city.slug}/streets/${street.slug}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{street.display_name || street.name}</h2><p className="mt-2 text-blue-700 font-bold">Walk this street →</p></Link>)}</section>
  </div></main>;
}
