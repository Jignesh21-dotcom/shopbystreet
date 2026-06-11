import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const revalidate = 600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is safe on server only
);

const SITEMAP_TTL_MS = 10 * 60 * 1000;

let cachedXml: string | null = null;
let cachedAt = 0;

export async function GET() {
  const now = Date.now();
  if (cachedXml && now - cachedAt < SITEMAP_TTL_MS) {
    return new NextResponse(cachedXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  }

  const baseUrl = 'https://www.localstreetshop.com';

  // Fetch data from Supabase
  const [{ data: cities }, { data: streets }, { data: shops }] = await Promise.all([
    supabase.from('cities').select('id, slug'),
    supabase.from('streets').select('id, slug, city_id'),
    supabase.from('shops').select('slug, street_id'),
  ]);

  const urls: string[] = [];

  // Add static pages
  const staticPaths = ['/', '/about', '/contact-us', '/discover', '/shop-owner/dashboard'];
  urls.push(...staticPaths);

  // Add cities
  if (cities) {
    for (const city of cities) {
      urls.push(`/cities/${city.slug}`);
    }
  }

  // Add streets (with their city slug)
  if (streets && cities) {
    for (const street of streets) {
      const city = cities.find((c) => c.id === street.city_id);
      if (city) {
        urls.push(`/cities/${city.slug}/${street.slug}`);
      }
    }
  }

  // Add shops (with street and city slugs)
  if (shops && streets && cities) {
    for (const shop of shops) {
      const street = streets.find((s) => s.id === shop.street_id);
      const city = street && cities.find((c) => c.id === street.city_id);
      if (city && street) {
        urls.push(`/cities/${city.slug}/${street.slug}/${shop.slug}`);
      }
    }
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  cachedXml = xml;
  cachedAt = now;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}