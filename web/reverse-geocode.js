const fs = require('fs');
const fetch = require('node-fetch');
const turf = require('@turf/turf');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Read the GeoJSON file
const geojson = JSON.parse(fs.readFileSync('./export.geojson', 'utf-8'));
const features = geojson.features;
const csvData = [];

// Create and initialize partial CSV with headers
const partialPath = 'partial_results.csv';
if (!fs.existsSync(partialPath)) {
  fs.writeFileSync(partialPath, 'Name,HighwayType,GeometryType,Lat,Lon,City\n');
}

// Reverse geocode function
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
  const headers = { 'User-Agent': 'LocalStreetShop/1.0 (your-email@example.com)' };
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    const address = data.address || {};
    return address.city || address.town || address.village || '';
  } catch (err) {
    console.error('❌ Geocoding error:', err.message);
    return '';
  }
}

// Main processor
async function process() {
  for (const feature of features) {
    const name = feature.properties?.name;
    const highway = feature.properties?.highway;
    const geomType = feature.geometry?.type;
    const geometry = feature.geometry;

    if (!name || !geometry) continue;

    try {
      const centroid = turf.centroid(feature).geometry.coordinates;
      const [lon, lat] = centroid;

      const city = await reverseGeocode(lat, lon);
      console.log(`✅ ${name} → ${city || 'No city found'}`);

      const record = { name, highway, geomType, lat, lon, city };
      csvData.push(record);

      // Save partial row to CSV
      fs.appendFileSync(
        partialPath,
        `${name},${highway},${geomType},${lat},${lon},${city || ''}\n`
      );

      // Respect rate limit
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }

  // Save final full file
  const csvWriter = createCsvWriter({
    path: 'streets_with_city.csv',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'highway', title: 'HighwayType' },
      { id: 'geomType', title: 'GeometryType' },
      { id: 'lat', title: 'Lat' },
      { id: 'lon', title: 'Lon' },
      { id: 'city', title: 'City' },
    ],
  });

  await csvWriter.writeRecords(csvData);
  console.log('\n🎉 All done! Full CSV saved as streets_with_city.csv');
}

process();
