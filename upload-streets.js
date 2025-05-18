const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const turf = require('@turf/turf');

// ✅ CONFIG: fill in your Supabase credentials
const SUPABASE_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxNzEwMiwiZXhwIjoyMDYxODkzMTAyfQ.GTYG3n1I2ea0LYdI8bLDytlYa6yH2s68z18aYsFuD68';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Mapping: city_slug → Supabase city_id
const CITY_IDS = {
  'central-elgin': '00568b20-67f5-421a-b5c7-5002b73717a0',
  'central-frontenac': '41fb8928-196f-4275-9dd7-28b9dfe3b236',
  'armour': '59a9c569-86c7-4d85-9134-0c1e717416a2',
  'armstrong': '8de35cb2-9fcf-4fd0-8ce6-02dea2b24545',
  'arnprior': '6b81fcb5-e9e2-4bec-bdc8-0bdc40e1d6a2',
  'arran-elderslie': '3f646299-dc19-4afb-80c0-50ed0b672f7e',
  'ashfield-colborne-wawanosh': 'a0739cc7-c860-464c-abeb-8a30e9236b27',
  'asphodel-norwood': '6953a36a-d0a1-4d4a-98fc-818254640f40',
  'assiginack': 'f6e33b54-b88f-47a3-8e6e-98a90329ed85',
  'athens': 'e2944911-e162-4e98-bf7e-75235c6e2339',
  'aurora': '6319eb5e-fb07-4f3b-b462-41dc09e58ddc',
  'barrie': '0083430d-ebee-4431-bca3-a335b3098963',
  'brampton': 'fd0e2dc3-70d0-43e5-9a50-c9fc776528f4',
  'brantford': 'b29bb940-59c9-4ff9-bb3a-e48359da4d8c',
  'burlington': '66a01f66-5f02-4feb-84c9-5078ec9a70fc',
  'caledon': '4cc52164-8e1a-4366-9497-f206a5434316',
  'cambridge': '8b740a22-2855-4a37-b4da-0e215b62a876',
  'belleville': '7632d2e4-d888-4eff-ba06-29e9dd92e4ed',
  'collingwood': '374249aa-f86d-480a-9f9e-a7852b856cb4',
  'cobourg': '1bbe7ea0-9280-41ee-a5b0-fad48be0c2ec',
  'cornwall': '1857a203-2130-4d8c-a746-0ec256529f12',
  'brant': 'f81d1f82-73e6-4752-8631-ba59432e2237',
  'dutton-dunwich': '2450e847-bd7a-4d63-b784-232dc4337257',
  'essa': 'e801deb8-0e4b-405e-9338-47d6b99afe96',
  'essex': 'bd8cad15-0650-4018-89e3-374c4332987e',
  'fort-erie': '7fbaf211-d124-40ff-b97e-194b5336b0ec',
  'fort-frances': '30790f17-d84e-40e1-8432-06ebb9cfb534',
  'gananoque': '705b0aea-b7ef-4fb5-8b89-de913f902ef0',
  'elizabethtown-kitley': '6e5fdbf0-7487-4193-8cef-a0eb4515cf5a',
  'elliot-lake': '4e81d490-d6ea-4ff5-b5aa-40e007857d85'
};


// 🛠 Slug generator
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
    .replace(/\s+/g, '-');
}

// 🔼 Upload one street row to Supabase
async function uploadStreet({ name, slug, city, city_id, lat, lon }) {
  const { error } = await supabase
    .from('streets')
    .insert({
      name,
      slug,
      city,
      city_id,
      province: 'ontario',
      country: 'canada',
      lat,
      lon,
      display_name: name
    });

  if (error) {
    console.error(`❌ ${city}: ${name} - ${error.message}`);
  } else {
    console.log(`✅ ${city}: ${name}`);
  }
}

// 📦 Process one GeoJSON file
async function processGeoFile(filePath) {
  const city = path.basename(filePath).split('_')[0];
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

  for (const way of ways) {
    try {
      const coords = way.nodes.map(id => nodes[id]).filter(Boolean);
      if (coords.length < 2) continue;
      const line = turf.lineString(coords);
      const centroid = turf.centroid(line).geometry.coordinates;

      await uploadStreet({
        name: way.tags.name,
        slug: `${city_slug}_${toSlug(way.tags.name)}`,
        city,
        city_id,
        lat: centroid[1],
        lon: centroid[0]
      });

    } catch (err) {
      console.error(`⚠️ Failed to process ${way.tags.name} in ${city}: ${err.message}`);
    }
  }
}

// 🔁 Batch process all *_streets.geojson files
(async () => {
  const files = fs.readdirSync('./').filter(f => f.endsWith('_streets.geojson'));
  for (const file of files) {
    console.log(`\n🌍 Processing ${file}`);
    await processGeoFile(file);
  }

  console.log('\n🎉 All street data uploaded to Supabase.');
})();
