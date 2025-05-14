require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const slugify = require('slugify');
const { createClient } = require('@supabase/supabase-js');

// Setup Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch street ID by slug
async function getStreetId(streetSlug) {
  const { data, error } = await supabase
    .from('streets')
    .select('id')
    .eq('slug', streetSlug)
    .single();

  if (error || !data) throw new Error(`Street not found: ${streetSlug}`);
  return data.id;
}

// Query Overpass API for intersecting nodes
async function getQueenWestIntersections() {
  const query = `
    [out:json][timeout:25];
    way["name"="Queen Street West"](43.64,-79.42,43.65,-79.28);
    node(w)->.n;
    way(around.n:20)["highway"];
    out body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const json = await response.json();
  const intersections = new Set();

  for (const el of json.elements) {
    if (el.tags?.name && el.tags.name !== 'Queen Street West') {
      intersections.add(el.tags.name);
    }
  }

  return Array.from(intersections).sort();
}

// Insert segments between consecutive intersections
async function insertSegments(intersections, streetId) {
  for (let i = 0; i < intersections.length - 1; i++) {
    const from = intersections[i];
    const to = intersections[i + 1];
    const name = `Queen St W between ${from} and ${to}`;
    const slug = slugify(`queen-w-${from}-to-${to}`, { lower: true });

    const { error } = await supabase.from('street_segments').insert({
      street_id: streetId,
      name,
      from_intersection: from,
      to_intersection: to,
      slug,
    });

    if (error) {
      console.error(`❌ Failed to insert ${name}`, error);
    } else {
      console.log(`✅ Inserted: ${name}`);
    }
  }
}

(async () => {
  try {
    const slug = 'queen-street-west'; // Match your Supabase slug exactly
    const streetId = await getStreetId(slug);
    const intersections = await getQueenWestIntersections();

    if (intersections.length < 2) {
      throw new Error('Not enough intersections found.');
    }

    await insertSegments(intersections, streetId);
    console.log('🎉 All segments inserted for Queen St W');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
