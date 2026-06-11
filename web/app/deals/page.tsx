// app/deals/page.tsx
import { supabase } from "@/lib/supabaseClient";
import DealsClient from "../components/deals/deals-client";

type DealsPageProps = {
  searchParams?: Promise<{
    province?: string;
    city?: string;
    sort?: string;
  }>;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const provinceFilter = params?.province || "";
  const cityFilter = params?.city || "";
  const sort = params?.sort || "biggest-discount";

  // Base query: only active 50%+ deals
  let query = supabase
    .from("deal_products_view")
    .select("product_id, product_name, original_price, sale_price, discount_percent, is_demo, is_active, image_url, shop_id, shop_name, shop_slug, shop_number, shop_group_name, street_id, street_name, street_slug, city_id, city_name, city_slug, province_id, province_name")
    .gte("discount_percent", 50)
    .eq("is_active", true);

  // Province filter (UUID)
  if (provinceFilter) {
    query = query.eq("province_id", provinceFilter);
  }

  // City filter (slug)
  if (cityFilter) {
    query = query.eq("city_slug", cityFilter);
  }

  // Sorting
  if (sort === "biggest-discount") {
    query = query.order("discount_percent", { ascending: false });
  } else if (sort === "lowest-price") {
    query = query.order("sale_price", { ascending: true });
  } else if (sort === "highest-price") {
    query = query.order("sale_price", { ascending: false });
  } else {
    query = query.order("discount_percent", { ascending: false });
  }

  const { data: deals, error } = await query;

  if (error) {
    console.error("Error loading deals:", error);
  }

  // Fetch provinces for filters
  const { data: provinces } = await supabase
    .from("provinces")
    .select("id, name")
    .order("name");

  // Fetch ALL cities using pagination
  let allCities: { id: string; name: string; slug: string; province_id: string }[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: citiesBatch } = await supabase
      .from("cities")
      .select("id, name, slug, province_id")
      .order("name")
      .range(from, from + batchSize - 1);

    if (citiesBatch && citiesBatch.length > 0) {
      allCities = [...allCities, ...citiesBatch];
      from += batchSize;
      
      if (citiesBatch.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return (
    <DealsClient
      deals={deals || []}
      provinces={provinces || []}
      cities={allCities}
      initialProvince={provinceFilter}
      initialCity={cityFilter}
      initialSort={sort}
    />
  );
}