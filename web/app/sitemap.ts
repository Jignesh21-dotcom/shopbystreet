import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.localstreetshop.com';

  const [{ data: cities }, { data: streets }, { data: shops }] =
    await Promise.all([
      supabase.from('cities').select('id, slug'),
      supabase.from('streets').select('id, slug, city_id'),
      supabase.from('shops').select('slug, street_id'),
    ]);

  const sitemap: MetadataRoute.Sitemap = [];

  // ------------------------
  // Static pages
  // ------------------------

  sitemap.push(
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/member`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shop-owner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop-owner-signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/home-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/expansion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    }
  );

  if (!cities || !streets || !shops) {
    return sitemap;
  }

  // ------------------------
  // Fast lookups
  // ------------------------

  const cityMap = new Map(
    cities.map((city) => [city.id, city.slug])
  );

  const streetMap = new Map(
    streets.map((street) => [street.id, street])
  );

  // ------------------------
  // Cities
  // ------------------------

  for (const city of cities) {
    sitemap.push({
      url: `${baseUrl}/cities/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // ------------------------
  // Streets
  // ------------------------

  for (const street of streets) {
    const citySlug = cityMap.get(street.city_id);

    if (!citySlug) continue;

    sitemap.push({
      url: `${baseUrl}/cities/${citySlug}/${street.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // ------------------------
  // Shops
  // ------------------------

  for (const shop of shops) {
    const street = streetMap.get(shop.street_id);

    if (!street) continue;

    const citySlug = cityMap.get(street.city_id);

    if (!citySlug) continue;

    sitemap.push({
      url: `${baseUrl}/cities/${citySlug}/${street.slug}/${shop.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return sitemap;
}