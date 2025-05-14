require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    // 1️⃣ Update shops
    const { error: shopError } = await supabase
      .from('shops')
      .update({ streetSlug: 'Queen-Street-West' })
      .eq('streetSlug', 'queen-st-w');

    if (shopError) {
      console.error('❌ Failed to update shops:', shopError);
    } else {
      console.log('✅ Updated shops streetSlug to Queen-Street-West');
    }

    // 2️⃣ Update street itself
    const { error: streetError } = await supabase
      .from('streets')
      .update({ slug: 'Queen-Street-West' })
      .eq('slug', 'queen-st-w');

    if (streetError) {
      console.error('❌ Failed to update streets:', streetError);
    } else {
      console.log('✅ Updated streets slug to Queen-Street-West');
    }
  } catch (err) {
    console.error('❌ Script Error:', err.message);
  }
})();
