require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Setup Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractNumber(description) {
  if (!description) return null;
  const match = description.match(/\b\d{2,5}\b/);
  return match ? parseInt(match[0], 10) : null;
}

async function run() {
  // Get Queen Street West
  const { data: street, error: streetError } = await supabase
    .from('streets')
    .select('id')
    .eq('slug', 'queen-street-west')
    .single();

  if (streetError || !street) {
    console.error('❌ Street not found.');
    return;
  }

  // Fetch all segments
  const { data: segments, error: segErr } = await supabase
    .from('street_segments')
    .select('id, name')
    .eq('street_id', street.id)
    .order('name');

  if (segErr || !segments) {
    console.error('❌ Failed to fetch segments');
    return;
  }

  // Fetch all shops
const { data: shops, error: shopErr } = await supabase
  .from('shops')
  .select('id, description')
  .ilike('streetSlug', 'queen-street-%') // <-- case-insensitive match
  .eq('approved', true);

if (shopErr || !shops) {
  console.error('❌ Failed to fetch shops');
  return;
}

console.log(`🔍 Found ${shops.length} Queen St W shops`);


  const addressNumbers = shops
    .map((shop) => extractNumber(shop.description))
    .filter((n) => typeof n === 'number')
    .sort((a, b) => a - b);

  if (addressNumbers.length < 2) {
    console.error('❌ Not enough valid address numbers found.');
    return;
  }

  const chunkSize = Math.ceil(addressNumbers.length / segments.length);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const chunk = addressNumbers.slice(i * chunkSize, (i + 1) * chunkSize);

    if (chunk.length === 0) {
      console.warn(`⚠️ No address numbers for segment ${segment.name}`);
      continue;
    }

    const min = Math.min(...chunk);
    const max = Math.max(...chunk);

    const { error } = await supabase
      .from('street_segments')
      .update({ range_start: min, range_end: max })
      .eq('id', segment.id);

    if (error) {
      console.error(`❌ Failed to update segment: ${segment.name}`, error);
    } else {
      console.log(`✅ Updated ${segment.name} (${min} - ${max})`);
    }
  }

  console.log('🎉 Finished updating Queen St W ranges by address.');
}

run();
