const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const turf = require('@turf/turf');

// ✅ Supabase config
const SUPABASE_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxNzEwMiwiZXhwIjoyMDYxODkzMTAyfQ.GTYG3n1I2ea0LYdI8bLDytlYa6yH2s68z18aYsFuD68';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Mapping of city slug to ID
const CITY_IDS = {
  'ajax': '3ae4b602-00df-4d39-8725-e618e7654eb1',
  'barrie': '0083430d-ebee-4431-bca3-a335b3098963',
};

// 🧠 Utility: create slugs
function toSlug(text) {
  return text.toLowerCase()
    .replace(/street/g, 'st')
    .replace(/avenue/g, 'ave')
    .replace(/road/g, 'rd')
    .replace(/drive/g, 'dr')
    .replace(/boulevard/g, 'blvd')
    .replace(/court/g, 'ct')
    .replace(/crescent/g, 'cres')
    .replace(/lane/g, 'ln')
    .replace(/trail/g, 'trl')
    .replace(/place/g, 'pl')
    .replace(/[.]/g, '')
    .replace(/'/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ✅ Upload street row
async function uploadStreet({ name, slug, city, city_id, lat, lon }) {
  const { error } = await supabase
    .from('streets')
    .upsert(
      {
        name,
        slug,
        city,
        city_id,
        province: 'ontario',
        country: 'canada',
        lat,
        lon,
        display_name: name
      },
      { onConflict: 'slug' }
    );

  if (error) {
    console.error(`❌ ${city}: ${name} - ${error.message}`);
  } else {
    console.log(`✅ ${city}: ${name}`);
  }
}

// 🧾 Process one city's geojson
async function processCity(filePath, city) {
  try {
    const city_slug = toSlug(city);
    const city_id = CITY_IDS[city_slug];

    if (!city_id) {
      console.warn(`⚠️ Skipping ${city} — no city_id mapped.`);
      return;
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const elements = raw.elements || [];
    const nodes = {};
    const ways = [];

    for (const el of elements) {
      if (el.type === 'node') nodes[el.id] = [el.lon, el.lat];
      if (el.type === 'way' && el.tags && el.tags.name && el.nodes) ways.push(el);
    }

    console.log(`📦 Found ${ways.length} streets in ${city}`);

    for (const way of ways) {
      try {
        const coords = way.nodes.map(id => nodes[id]).filter(Boolean);
        if (coords.length < 2) continue;

        const line = turf.lineString(coords);
        const centroid = turf.centroid(line).geometry.coordinates;

        const cleanSlug = toSlug(way.tags.name); // ✅ no "ajax-" prefix


        // ✅ Check if slug exists before inserting
        const { data: existing, error: fetchError } = await supabase
          .from('streets')
          .select('id')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (fetchError) {
          console.error(`⚠️ Failed checking ${way.tags.name}: ${fetchError.message}`);
          continue;
        }

        if (existing) {
          console.log(`⏭️ Skipping duplicate: ${way.tags.name}`);
          continue;
        }

        await uploadStreet({
          name: way.tags.name,
          slug: cleanSlug,
          city,
          city_id,
          lat: centroid[1],
          lon: centroid[0]
        });

      } catch (err) {
        console.error(`⚠️ ${city}: Failed ${way.tags.name} - ${err.message}`);
      }
    }

    console.log(`🎉 Finished uploading for ${city}`);
    process.exit(0);

  } catch (err) {
    console.error(`❌ Unexpected error: ${err.message}`);
    process.exit(1);
  }
}

// 👇 Target city for upload
const city = 'ajax';
const filePath = `./${city}_streets.geojson`;

processCity(filePath, city);