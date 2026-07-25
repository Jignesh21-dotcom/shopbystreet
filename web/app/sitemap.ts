import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type CityRow = {
  id: string;
  slug: string;
  province:
    | {
        slug: string;
        country:
          | {
              slug: string;
            }
          | {
              slug: string;
            }[]
          | null;
      }
    | {
        slug: string;
        country:
          | {
              slug: string;
            }
          | {
              slug: string;
            }[]
          | null;
      }[]
    | null;
};

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.localstreetshop.com';
  const now = new Date();

  const [{ data: cities }, { data: streets }, { data: shops }] =
    await Promise.all([
      supabase.from('cities').select(`
        id,
        slug,
        province:province_id (
          slug,
          country:countries (
            slug
          )
        )
      `),
      supabase.from('streets').select('id, slug, city_id'),
      supabase
        .from('shops')
        .select('slug, street_id')
        .eq('approved', true),
    ]);

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/live-cities?country=canada`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/live-cities?country=india`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/countries/canada`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/countries/india`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/countries/india/gujarat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/business-owners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/countries/india/business-owners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community-partners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/home-businesses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shop-owner`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop-owner/claim`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop-owner-signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  if (!cities || !streets || !shops) return sitemap;

  const cityMap = new Map<
    string,
    {
      slug: string;
      provinceSlug: string;
      countrySlug: string;
    }
  >();

  for (const rawCity of cities as unknown as CityRow[]) {
    const province = unwrap(rawCity.province);
    const country = unwrap(province?.country);

    cityMap.set(rawCity.id, {
      slug: rawCity.slug,
      provinceSlug: province?.slug || '',
      countrySlug: country?.slug || 'canada',
    });

    const cityUrl =
      country?.slug === 'india'
        ? `${baseUrl}/countries/india/${province?.slug || 'gujarat'}/${rawCity.slug}`
        : `${baseUrl}/cities/${rawCity.slug}`;

    sitemap.push({
      url: cityUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  const streetMap = new Map<
    string,
    {
      slug: string;
      cityId: string;
    }
  >();

  for (const street of streets) {
    streetMap.set(street.id, {
      slug: street.slug,
      cityId: street.city_id,
    });

    const city = cityMap.get(street.city_id);
    if (!city) continue;

    const streetUrl =
      city.countrySlug === 'india'
        ? `${baseUrl}/countries/india/${city.provinceSlug || 'gujarat'}/${city.slug}/streets/${street.slug}`
        : `${baseUrl}/cities/${city.slug}/${street.slug}`;

    sitemap.push({
      url: streetUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const shop of shops) {
    const street = streetMap.get(shop.street_id);
    if (!street) continue;

    const city = cityMap.get(street.cityId);
    if (!city) continue;

    const shopUrl =
      city.countrySlug === 'india'
        ? `${baseUrl}/countries/india/${city.provinceSlug || 'gujarat'}/${city.slug}/streets/${street.slug}/${shop.slug}`
        : `${baseUrl}/cities/${city.slug}/${street.slug}/${shop.slug}`;

    sitemap.push({
      url: shopUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return sitemap;
}
