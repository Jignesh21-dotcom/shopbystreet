import ShopClient from './ShopClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

// ✅ Use `generateStaticParams` to handle dynamic routes
export async function generateStaticParams() {
  // Fetch all streets from the database
  const { data: streets, error } = await supabase
    .from('streets')
    .select('slug');

  if (error || !streets) {
    console.error('Failed to fetch streets:', error);
    return [];
  }

  return streets.map((street) => ({
    street: street.slug,
  }));
}

// ✅ Server Component for ShopPage
export default async function ShopPage({ params }: ShopPageProps) {
  const { street } = params;

  // Fetch street data on the server
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select('id, name, slug')
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`);
    return <div>Street not found.</div>; // Gracefully handle missing street
  }

  // Fetch shops for the street
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('name, slug')
    .eq('street_id', streetData.id)
    .order('name', { ascending: true });

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${street}`);
    return <div>No shops found for this street.</div>; // Gracefully handle missing shops
  }

  // Pass the fetched data to the client component
  return <ShopClient street={streetData.name} shops={shops} />;
}