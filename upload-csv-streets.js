const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// ✅ Supabase config
const SUPABASE_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // replace with real key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Utility: slug generator
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

// ✅ Upload function
async function uploadStreet(row) {
  const { name, slug, city, city_id, lat, lon } = row;

  const { error } = await supabase
    .from('streets')
    .upsert(
      {
        name,
        slug: toSlug(slug),
        city,
        city_id,
        province: 'ontario',
        country: 'canada',
        lat: parseFloat(lat) || null,
        lon: parseFloat(lon) || null,
        display_name: name
      },
      { onConflict: 'slug' }
    );

  if (error) {
    console.error(`❌ Failed to insert ${name}:`, error.message);
  } else {
    console.log(`✅ Inserted: ${name}`);
  }
}

// ✅ Main function
function processCSV(csvPath) {
  const stream = fs.createReadStream(csvPath).pipe(csv());
  stream.on('data', async (row) => {
    stream.pause(); // Pause while inserting
    await uploadStreet(row);
    stream.resume(); // Resume after insert
  });

  stream.on('end', () => {
    console.log('🎉 Finished uploading all rows.');
  });

  stream.on('error', (err) => {
    console.error('❌ Error reading CSV:', err.message);
  });
}

// 👇 Set your file path here
processCSV('./ajax_streets_final_upload.csv');