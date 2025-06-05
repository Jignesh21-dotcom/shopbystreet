import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is safe on server only
);

export async function GET() {
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

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}