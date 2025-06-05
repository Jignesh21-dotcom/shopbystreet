import { supabase } from "@/lib/supabaseClient";

// ✅ Provinces by country slug (Supabase version)
export async function getProvincesByCountrySlug(countrySlug: string) {
  // First get the country ID
  const { data: countryData, error: countryError } = await supabase
    .from('countries')
    .select('id')
    .eq('slug', countrySlug)
    .single();

  if (countryError || !countryData) {
    console.error('Error fetching country:', countryError);
    return [];
  }

  const countryId = countryData.id;

  // Now get provinces linked to that country
  const { data: provincesData, error: provincesError } = await supabase
    .from('provinces')
    .select('id, name, slug') // <-- include id
    .eq('country_id', countryId)
    .order('name');

  if (provincesError) {
    console.error('Error fetching provinces:', provincesError);
    return [];
  }

  return provincesData;
}

// ✅ Cities by province slug (Supabase version)
export async function getCitiesByProvinceSlug(provinceSlug: string) {
  // First get the province ID
  const { data: provinceData, error: provinceError } = await supabase
    .from('provinces')
    .select('id')
    .eq('slug', provinceSlug)
    .single();

  if (provinceError || !provinceData) {
    console.error('Error fetching province:', provinceError);
    return [];
  }

  const provinceId = provinceData.id;

  // Now get cities linked to that province
  const { data: citiesData, error: citiesError } = await supabase
    .from('cities')
    .select('id, name, slug') // <-- include id
    .eq('province_id', provinceId)
    .order('name');

  if (citiesError) {
    console.error('Error fetching cities:', citiesError);
    return [];
  }

  return citiesData;
}

// ✅ Streets by city slug (Supabase version)
export async function getStreetsByCitySlug(citySlug: string) {
  // First get the city ID
  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', citySlug)
    .single();

  if (cityError || !cityData) {
    console.error('Error fetching city:', cityError);
    return [];
  }

  const cityId = cityData.id;

  // Now get streets linked to that city
  const { data: streetsData, error: streetsError } = await supabase
    .from('streets')
    .select('id, name, slug') // <-- include id
    .eq('city_id', cityId)
    .order('name');

  if (streetsError) {
    console.error('Error fetching streets:', streetsError);
    return [];
  }

  return streetsData;
}

// ✅ Shops by street slug (Supabase version)
export async function getShopsByStreetSlug(streetSlug: string) {
  // First get the street ID
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select('id')
    .eq('slug', streetSlug)
    .single();

  if (streetError || !streetData) {
    console.error('Error fetching street:', streetError);
    return [];
  }

  const streetId = streetData.id;

  // Now get shops linked to that street
  const { data: shopsData, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug') // <-- include id
    .eq('street_id', streetId)
    .order('name');

  if (shopsError) {
    console.error('Error fetching shops:', shopsError);
    return [];
  }

  return shopsData;
}