require('dotenv').config({ path: '.env.local' });
// ✅ Patch for fetch compatibility
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');

// Setup Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get street_id from DB
async function getStreetId(streetSlug) {
  const { data, error } = await supabase
    .from('streets')
    .select('id')
    .eq('slug', streetSlug)
    .single();

  if (error || !data) {
    throw new Error(`Street with slug "${streetSlug}" not found.`);
  }

  return data.id;
}

// Fetch intersections from Overpass API
async function getYongeIntersections() {
  const query = `
    [out:json];
    way["name"="Yonge Street"](43.6,-79.4,43.8,-79.3);
    node(w)->.n;
    way(around.n:20)["highway"];
    out body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const json = await response.json();
  const names = new Set();

  for (const element of json.elements) {
    if (element.tags?.name && element.tags.name !== 'Yonge Street') {
      names.add(element.tags.name);
    }
  }

  return Array.from(names).sort();
}

// Save segments to Supabase
async function insertSegments(intersections, streetId) {
  for (let i = 0; i < intersections.length - 1; i++) {
    const from = intersections[i];
    const to = intersections[i + 1];

    const name = `Yonge St between ${from} and ${to}`;
    const slug = slugify(`yonge-${from}-to-${to}`, { lower: true });

    const { error } = await supabase.from('street_segments').insert({
      street_id: streetId,
      name,
      from_intersection: from,
      to_intersection: to,
      slug,
    });

    if (error) {
      console.error(`❌ Failed to insert segment: ${name}`, error);
    } else {
      console.log(`✅ Inserted: ${name}`);
    }
  }
}

async function main() {
  try {
    const streetSlug = 'yonge-st'; // <-- Must match your slug in streets table
    const streetId = await getStreetId(streetSlug);
    const intersections = await getYongeIntersections();

    if (intersections.length < 2) {
      throw new Error('Not enough intersections found.');
    }

    await insertSegments(intersections, streetId);
    console.log('✅ All segments inserted into Supabase.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
