import countries from "@/data/countries.json";
import provinces from "@/data/provinces.json";
import cities from "@/data/cities.json";
import streets from "@/data/streets.json"; // Already imported here!

// Your existing functions...
export async function getProvincesByCountrySlug(slug: string) {
  return provinces.filter((province) => province.countrySlug === slug);
}

export async function getCitiesByProvinceSlug(slug: string) {
  return cities.filter((city) => city.provinceSlug === slug);
}

// New function (no re-import needed!)
export async function getStreetsByCitySlug(slug: string) {
  return streets.filter((street) => street.citySlug === slug);
}
import shops from "@/data/shops.json";

export async function getShopsByStreetSlug(slug: string) {
  return shops.filter((shop) => shop.streetSlug === slug);
}
