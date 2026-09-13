import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 300;
type Props = { params: Promise<{ state:string; city:string; street:string }> };
const norm=(v:string)=>decodeURIComponent(v||'').toLowerCase().trim().replace(/\s+/g,'-');
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});

export default async function IndiaStreetPage({params}:Props){
 const p=await params; const stateSlug=norm(p.state), citySlug=norm(p.city), streetSlug=norm(p.street);
 const {data:country}=await supabase.from('countries').select('id').eq('slug','india').maybeSingle();
 const {data:state}=country?await supabase.from('provinces').select('id,name,slug').eq('country_id',country.id).eq('slug',stateSlug).maybeSingle():{data:null};
 const {data:city}=state?await supabase.from('cities').select('id,name,slug').eq('province_id',state.id).eq('slug',citySlug).maybeSingle():{data:null};
 const {data:street}=city?await supabase.from('streets').select('id,name,display_name,slug').eq('city_id',city.id).eq('slug',streetSlug).maybeSingle():{data:null};
 if(!state||!city||!street)return <main className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-8"><h1 className="text-3xl font-black">Street not found</h1></div></main>;
 const {data:shops}=await supabase.from('shops').select('id,name,slug,description,address,image_url,category').eq('street_id',street.id).eq('approved',true).order('name');
 return <main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-6xl">
  <Link href={`/countries/india/${state.slug}/${city.slug}`} className="font-bold text-orange-700">← {city.name}</Link>
  <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-orange-600 to-green-700 p-8 text-white"><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">{city.name}, {state.name}</p><h1 className="mt-3 text-4xl font-black">{street.display_name||street.name}</h1><p className="mt-3 text-white/90">Walk the street online and discover approved local businesses.</p></section>
  <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(shops||[]).map(shop=><Link key={shop.id} href={`/countries/india/${state.slug}/${city.slug}/streets/${street.slug}/${shop.slug}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">{shop.image_url?<img src={shop.image_url} alt="" className="h-44 w-full object-cover"/>:<div className="flex h-44 items-center justify-center bg-orange-50 text-5xl">🏪</div>}<div className="p-5"><h2 className="text-xl font-black">{shop.name}</h2>{shop.category&&<p className="mt-1 text-sm font-bold text-orange-700">{shop.category}</p>}<p className="mt-2 line-clamp-2 text-slate-600">{shop.description||shop.address||'Local business'}</p></div></Link>)}</section>
 </div></main>;
}
