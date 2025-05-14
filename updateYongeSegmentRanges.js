require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 🔑 Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔧 Extract leading number from address
const getAddressNumber = (description) => {
  if (!description) return null;
  const match = description.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

(async () => {
  try {
    // 1️⃣ Get Yonge Street ID
    const { data: streetData, error: streetError } = await supabase
      .from('streets')
      .select('id')
      .eq('slug', 'yonge-st')
      .single();

    if (streetError || !streetData) {
      throw new Error('Yonge Street not found in streets table');
    }

    const streetId = streetData.id;

    // 2️⃣ Get all Yonge Street shops
    const { data: shops, error: shopError } = await supabase
      .from('shops')
      .select('id, description')
      .eq('streetSlug', 'yonge-st');

    if (shopError) throw shopError;

    const addressShops = shops
      .map((shop) => ({
        id: shop.id,
        number: getAddressNumber(shop.description),
      }))
      .filter((s) => s.number !== null);

    // 3️⃣ Get all segments without ranges
    const { data: segments, error: segmentError } = await supabase
      .from('street_segments')
      .select('id, from_intersection, to_intersection')
      .eq('street_id', streetId);

    if (segmentError) throw segmentError;

    // 4️⃣ Match shops to each segment and compute ranges
    for (const segment of segments) {
      const relevantShops = shops.filter((shop) => {
        const text = shop.description?.toLowerCase() || '';
        return (
          text.includes(segment.from_intersection.toLowerCase()) ||
          text.includes(segment.to_intersection.toLowerCase())
        );
      });

      const numbers = relevantShops
        .map((shop) => getAddressNumber(shop.description))
        .filter((n) => typeof n === 'number');

      if (numbers.length === 0) {
        console.log(`⚠️ No address numbers found for segment: ${segment.id}`);
        continue;
      }

      const range_start = Math.min(...numbers);
      const range_end = Math.max(...numbers);

      // 5️⃣ Update segment with range
      const { error: updateError } = await supabase
        .from('street_segments')
        .update({ range_start, range_end })
        .eq('id', segment.id);

      if (updateError) {
        console.error(`❌ Failed to update segment ${segment.id}`, updateError);
      } else {
        console.log(`✅ Updated segment ${segment.id}: ${range_start} - ${range_end}`);
      }
    }

    console.log('🎉 All segment ranges processed.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
