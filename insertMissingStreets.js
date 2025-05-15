require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// These were extracted from your CSV, skipping "A BLOOR ST"
const missingStreets = [
  "ABACUS RD", "ABELL AVE", "ABERDEEN BLVD", "ACADEMY DR", "ACADEMY RD",
  "ACCORD AVE", "ACKLAM TERRACE", "ACME CRES", "ADELAIDE ST", "ADRIENNE DR",
  "AERODROME CRES", "AGATE RD", "AGNES LANE", "AGNES ST", "AINSWORTH ST",
  "AIRPORT RD", "ALABAMA AVE", "ALBANY AVE", "ALBERT AVE", "ALBERTUS AVE"
  // ... add more from the full list if needed
];

async function run() {
  // Step 1: Get city_id for Toronto
  const { data: cities, error: cityErr } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', 'toronto')
    .single();

  if (cityErr || !cities) {
    console.error('❌ Failed to find Toronto city ID.', cityErr);
    return;
  }

  const cityId = cities.id;

  let insertedCount = 0;

  for (const name of missingStreets) {
    const formattedName = name.trim().replace(/\s+/g, ' ');
    const slug = slugify(formattedName, { lower: true });

    const { error } = await supabase
      .from('streets')
      .insert({
        name: formattedName,
        slug,
        city_id: cityId
      });

    if (error) {
      console.error(`❌ Failed to insert street: ${formattedName}`, error);
    } else {
      console.log(`✅ Inserted: ${formattedName}`);
      insertedCount++;
    }
  }

  console.log(`🎉 Done. Inserted ${insertedCount} missing streets.`);
}

run();
