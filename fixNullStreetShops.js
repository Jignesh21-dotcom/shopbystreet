require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Extracts street name from "123 QUEEN ST W" → "QUEEN ST W"
function extractStreet(description) {
  if (!description) return null;
  const match = description.toUpperCase().match(
    /\d+\s+([A-Z\s]+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|CIR|DR|LANE|WAY|CRES|COURT|PL|PLACE|PKWY|TERR|TRL))/
  );
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

async function run() {
  // Fetch all streets
  const { data: streets, error: streetErr } = await supabase
    .from('streets')
    .select('id, name');

  if (streetErr || !streets) {
    console.error('❌ Failed to load streets');
    return;
  }

  const streetMap = {};
  for (const s of streets) {
    streetMap[s.name.toUpperCase().replace(/\s+/g, ' ')] = s.id;
  }

  // Get all approved shops missing street_id
  const { data: shops, error: shopErr } = await supabase
    .from('shops')
    .select('id, description')
    .is('street_id', null)
    .eq('approved', true);

  if (shopErr || !shops) {
    console.error('❌ Failed to fetch shops');
    return;
  }

  let updated = 0;

  for (const shop of shops) {
    const extracted = extractStreet(shop.description);
    const normalized = extracted?.toUpperCase().replace(/\s+/g, ' ');

    const streetId = streetMap[normalized];

    if (streetId) {
      const { error } = await supabase
        .from('shops')
        .update({ street_id: streetId })
        .eq('id', shop.id);

      if (error) {
        console.error(`❌ Failed to update shop ${shop.id}`, error);
      } else {
        console.log(`✅ Linked shop ${shop.id} → ${normalized}`);
        updated++;
      }
    } else {
      console.warn(`⚠️ No match for "${extracted}" in shop ${shop.id}`);
    }
  }

  console.log(`🎉 Finished. Updated ${updated} shops.`);
}

run();
