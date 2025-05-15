require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractStreet(description) {
  if (!description) return null;
  const match = description.toUpperCase().match(
    /\d+\s+([A-Z\s]+(?:ST|STREET|AVE|AVENUE|RD|ROAD|BLVD|CIR|DR|LANE|WAY|CRES|COURT|PL|PLACE))/
  );
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

async function run() {
  // Get all streets
  const { data: streets, error: streetErr } = await supabase
    .from('streets')
    .select('id, name');

  if (streetErr || !streets) {
    console.error('❌ Failed to fetch streets');
    return;
  }

  // Map street names for quick lookup
  const streetMap = {};
  for (const s of streets) {
    streetMap[s.name.toUpperCase().replace(/\s+/g, ' ')] = s.id;
  }

  // Get shops without street_id or mismatched
  const { data: shops, error: shopErr } = await supabase
    .from('shops')
    .select('id, description, street_id')
    .eq('approved', true);

  if (shopErr || !shops) {
    console.error('❌ Failed to fetch shops');
    return;
  }

  let updatedCount = 0;

  for (const shop of shops) {
    const extracted = extractStreet(shop.description);
    const normalized = extracted?.toUpperCase().replace(/\s+/g, ' ');

    const newStreetId = streetMap[normalized];

    if (newStreetId && shop.street_id !== newStreetId) {
      const { error } = await supabase
        .from('shops')
        .update({ street_id: newStreetId })
        .eq('id', shop.id);

      if (error) {
        console.error(`❌ Failed to update shop ${shop.id}`, error.message);
      } else {
        console.log(`✅ Updated shop ${shop.id} → ${normalized}`);
        updatedCount++;
      }
    }
  }

  console.log(`🎉 Done. Updated ${updatedCount} shops with correct street_id.`);
}

run();
