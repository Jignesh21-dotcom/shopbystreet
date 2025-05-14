require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to get numeric address from description
const getAddressNumber = (description) => {
  if (!description) return null;
  const match = description.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

(async () => {
  try {
    // 1. Get Yonge street ID
    const { data: street, error: streetError } = await supabase
      .from('streets')
      .select('id')
      .eq('slug', 'yonge-st')
      .single();

    if (streetError || !street) throw new Error('Could not find Yonge Street');

    const streetId = street.id;

    // 2. Fetch all segments
    const { data: segments, error: segmentError } = await supabase
      .from('street_segments')
      .select('id')
      .eq('street_id', streetId)
      .order('id'); // sorted to stay consistent

    if (segmentError || !segments) throw segmentError;

    // 3. Fetch all Yonge shops with usable address
    const { data: shops, error: shopError } = await supabase
      .from('shops')
      .select('id, description')
      .eq('streetSlug', 'yonge-st');

    if (shopError || !shops) throw shopError;

    const addressShops = shops
      .map((shop) => ({
        id: shop.id,
        number: getAddressNumber(shop.description),
      }))
      .filter((s) => s.number !== null)
      .sort((a, b) => a.number - b.number);

    const numbers = addressShops.map((s) => s.number);
    const totalShops = numbers.length;
    const segmentCount = segments.length;
    const chunkSize = Math.floor(totalShops / segmentCount);

    console.log(`📦 ${totalShops} addressable shops across ${segmentCount} segments`);

    for (let i = 0; i < segmentCount; i++) {
      const startIndex = i * chunkSize;
      const endIndex = i === segmentCount - 1 ? totalShops : (i + 1) * chunkSize;
      const segmentNumbers = numbers.slice(startIndex, endIndex);

      if (segmentNumbers.length === 0) {
        console.log(`⚠️ Segment ${segments[i].id} skipped — no shops`);
        continue;
      }

      const range_start = Math.min(...segmentNumbers);
      const range_end = Math.max(...segmentNumbers);

      const { error: updateError } = await supabase
        .from('street_segments')
        .update({ range_start, range_end })
        .eq('id', segments[i].id);

      if (updateError) {
        console.error(`❌ Failed to update segment ${segments[i].id}`, updateError);
      } else {
        console.log(`✅ Updated segment ${segments[i].id}: ${range_start}–${range_end}`);
      }
    }

    console.log('🎯 All Yonge Street segments updated with address ranges.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
