require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('🔍 Fetching all streets...');
  const { data: streets, error: streetError } = await supabase
    .from('streets')
    .select('id, slug, city_id');

  if (streetError || !streets) {
    console.error('❌ Failed to fetch streets:', streetError);
    return;
  }

  const streetMap = Object.fromEntries(
    streets.map((s) => [s.slug.toLowerCase(), s])
  );

  console.log('🔍 Fetching shops with missing street/city...');
  const { data: shops, error: shopError } = await supabase
    .from('shops')
    .select('id, streetSlug')
    .or('street_id.is.null,city_id.is.null');

  if (shopError || !shops) {
    console.error('❌ Failed to fetch shops:', shopError);
    return;
  }

  let updated = 0;

  for (const shop of shops) {
    const slug = (shop.streetSlug || '').toLowerCase();
    const matched = streetMap[slug];

    if (matched) {
      const { error } = await supabase
        .from('shops')
        .update({
          street_id: matched.id,
          city_id: matched.city_id,
        })
        .eq('id', shop.id);

      if (error) {
        console.warn(`⚠️ Failed to update shop ${shop.id}`, error);
      } else {
        console.log(`✅ Updated shop ${shop.id} → ${matched.slug}`);
        updated++;
      }
    } else {
      console.warn(`⚠️ No matching street found for shop ${shop.id} (${shop.streetSlug})`);
    }
  }

  console.log(`🎉 Done. Updated ${updated} shops with correct street/city IDs.`);
}

run();
