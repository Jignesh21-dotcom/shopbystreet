// app/deals/page.tsx
import { supabase } from '@/lib/supabaseClient';
import DealsClient from '../components/deals/deals-client';

type DealsPageProps = {
  searchParams?: Promise<{
    country?: string;
    province?: string;
    city?: string;
    sort?: string;
  }>;
};

type Country = { id: string; name: string; slug: string };
type Province = {
  id: string;
  name: string;
  slug: string;
  country_id: string;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const countryFilter = params?.country || '';
  const provinceFilter = params?.province || '';
  const cityFilter = params?.city || '';
  const sort = params?.sort || 'biggest-discount';

  const [{ data: countriesData }, { data: provincesData }] = await Promise.all([
    supabase.from('countries').select('id, name, slug').order('name'),
    supabase.from('provinces').select('id, name, slug, country_id').order('name'),
  ]);

  const countries = (countriesData || []) as Country[];
  const provinces = (provincesData || []) as Province[];
  const selectedCountry = countries.find((country) => country.slug === countryFilter);
  const allowedProvinceIds = selectedCountry
    ? provinces.filter((province) => province.country_id === selectedCountry.id).map((province) => province.id)
    : [];

  let query = supabase
    .from('deal_products_view')
    .select(
      'product_id, product_name, original_price, sale_price, discount_percent, is_demo, is_active, image_url, shop_id, shop_name, shop_slug, shop_number, shop_group_name, street_id, street_name, street_slug, city_id, city_name, city_slug, province_id, province_name'
    )
    .gte('discount_percent', 50)
    .eq('is_active', true);

  if (selectedCountry) {
    if (allowedProvinceIds.length > 0) {
      query = query.in('province_id', allowedProvinceIds);
    } else {
      // A selected country with no configured regions should return no deals.
      query = query.eq('province_id', '00000000-0000-0000-0000-000000000000');
    }
  }

  if (provinceFilter) {
    query = query.eq('province_id', provinceFilter);
  }

  if (cityFilter) {
    query = query.eq('city_slug', cityFilter);
  }

  if (sort === 'lowest-price') {
    query = query.order('sale_price', { ascending: true });
  } else if (sort === 'highest-price') {
    query = query.order('sale_price', { ascending: false });
  } else {
    query = query.order('discount_percent', { ascending: false });
  }

  const { data: deals, error } = await query;

  if (error) {
    console.error('Error loading deals:', error);
  }

  let allCities: { id: string; name: string; slug: string; province_id: string }[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: citiesBatch } = await supabase
      .from('cities')
      .select('id, name, slug, province_id')
      .order('name')
      .range(from, from + batchSize - 1);

    if (citiesBatch && citiesBatch.length > 0) {
      allCities = [...allCities, ...citiesBatch];
      from += batchSize;
      hasMore = citiesBatch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return (
    <DealsClient
      deals={deals || []}
      countries={countries}
      provinces={provinces}
      cities={allCities}
      initialCountry={selectedCountry?.slug || ''}
      initialProvince={provinceFilter}
      initialCity={cityFilter}
      initialSort={sort}
    />
  );
}
