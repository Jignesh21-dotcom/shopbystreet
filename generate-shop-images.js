// 🚀 Shop Image Fetcher + Sketchify Uploader + Supabase Updater

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

// ✅ CONFIG - fill in your keys
const PEXELS_API_KEY = '5Lr5hSW7eywIyJL2H8vPRVdDEb8HEdgHLhGZrI12oDHL6CPLSvyoINQW';
const CLOUDINARY_CONFIG = {
  cloud_name: 'decaq9iln',
  api_key: '572875798637778',
  api_secret: '2UmXNiC1XQB0HJxMrd9WujWPIbo',
};

const SUPABASE_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxNzEwMiwiZXhwIjoyMDYxODkzMTAyfQ.GTYG3n1I2ea0LYdI8bLDytlYa6yH2s68z18aYsFuD68';  // Use service role key for write access

cloudinary.config(CLOUDINARY_CONFIG);

const INPUT_CSV = './shops-missing-images.csv';
const OUTPUT_JSON = './shops-with-images.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const results = [];

// 🔄 Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

(async () => {
  fs.createReadStream(INPUT_CSV)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      console.log(`✅ Loaded ${results.length} shops from CSV.`);
      const shops = [];

      for (const shop of results) {
        const name = shop['Client Name'] || 'Unnamed';
        const street = shop['Licence Address Line 1'] || shop['License Address 1'] || 'unknown';
        const city = shop['License Address 2'] || '';
        const parking = 'Unknown';
        const slug = slugify(name);
        const streetSlug = slugify(street);

        console.log(`▶️ Processing: ${name}`);

        let success = false;
        while (!success) {
          try {
            // 1️⃣ Fetch image from Pexels
            const searchQuery = `${name} ${city} storefront`;
            const pexelsRes = await axios.get('https://api.pexels.com/v1/search', {
              headers: { Authorization: PEXELS_API_KEY },
              params: { query: searchQuery, per_page: 1 },
            });

            const photoUrl =
              pexelsRes.data.photos && pexelsRes.data.photos.length > 0
                ? pexelsRes.data.photos[0].src.large
                : null;

            if (!photoUrl) {
              console.log(`❌ No image found for: ${name}`);
              shops.push({ name, slug, streetSlug, parking, imageUrl: null });
              await sleep(1200);  // small delay even if no image
              success = true;
              continue;
            }

            // 2️⃣ Upload to Cloudinary with cartoon/sketch effect
            const uploadRes = await cloudinary.uploader.upload(photoUrl, {
              folder: 'shops-sketch',
              public_id: slug,
              transformation: [
                { effect: 'cartoonify', line_strength: 80 },
                { radius: 10 },
              ],
            });

            const finalImageUrl = uploadRes.secure_url;

            console.log(`✅ Uploaded & sketchified: ${finalImageUrl}`);

            // 3️⃣ Update Supabase with image_url
            const { error: updateErr } = await supabase
              .from('shops')
              .update({ image_url: finalImageUrl })
              .eq('slug', slug);

            if (updateErr) {
              console.error(`❌ Supabase update error for ${name}:`, updateErr.message);
            } else {
              console.log(`✅ Supabase updated for ${name} (slug: ${slug})`);
            }

            shops.push({
              name,
              slug,
              streetSlug,
              parking,
              imageUrl: finalImageUrl,
            });

            await sleep(1500);  // regular delay
            success = true;
          } catch (err) {
            if (err.response && err.response.status === 429) {
              console.warn(`⏸ Hit rate limit (429). Waiting 60 minutes before retrying...`);
              await sleep(60 * 60 * 1000);  // 1 hour pause
            } else {
              console.error(`⚠️ Error for ${name}:`, err.message);
              shops.push({ name, slug, streetSlug, parking, imageUrl: null });
              await sleep(1200);
              success = true;  // move to next shop even if failed
            }
          }
        }
      }

      // ✅ Save JSON backup
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(shops, null, 2));
      console.log(`🎉 Done! Saved local backup to ${OUTPUT_JSON}`);
    });
})();
