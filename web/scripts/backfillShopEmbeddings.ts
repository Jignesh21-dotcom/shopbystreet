// scripts/backfillShopEmbeddings.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service key so we can update
);

async function main() {
  const batchSize = 100;

  while (true) {
    // 1) Get shops missing embeddings
    const { data: shops, error } = await supabase
      .from('shops')
      .select('id, name, description, street_id, city_id')
      .is('embedding', null)
      .limit(batchSize);

    if (error) {
      console.error('Error fetching shops:', error);
      break;
    }

    if (!shops || shops.length === 0) {
      console.log('✅ Done. No more shops to embed.');
      break;
    }

    console.log(`Embedding batch of ${shops.length} shops...`);

    // 2) Build input strings for embedding
    const inputs = shops.map((shop) => {
      const parts = [
        shop.name ?? '',
        shop.description ?? '',
        // you can add more, like street/city names later
      ].filter(Boolean);

      return parts.join(' — ');
    });

    // 3) Call OpenAI embeddings API (batch mode)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: inputs,
    });

    // 4) Update each shop with embedding
    const updates = shops.map((shop, i) => ({
      id: shop.id,
      embedding: response.data[i].embedding,
    }));

    const { error: updateError } = await supabase
      .from('shops')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) {
      console.error('Error updating embeddings:', updateError);
      break;
    }

    console.log(`✅ Updated ${shops.length} shops with embeddings.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
