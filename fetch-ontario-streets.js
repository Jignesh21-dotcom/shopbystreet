const fs = require('fs');
const fetch = require('node-fetch');

const cities = [
  "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Windsor", "Sudbury", "Barrie",
  "Guelph", "Kingston", "Cambridge", "Waterloo", "Oshawa", "Burlington", "St. Catharines", "Niagara Falls", "Whitby", "Ajax",
  "Pickering", "Oakville", "Richmond Hill", "Newmarket", "Milton", "Peterborough", "North Bay", "Sault Ste. Marie", "Thunder Bay", "Welland",
  "Orillia", "Belleville", "Brantford", "Stratford", "St. Thomas", "Aurora", "Cornwall", "Orangeville", "Timmins", "Owen Sound",
  "Lindsay", "Leamington", "Innisfil", "Caledon", "Quinte West", "Kenora", "Grimsby", "Collingwood", "Cobourg", "Elliot Lake"
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchStreets(city) {
  const query = `
    [out:json][timeout:180];
    area["name"="${city}"]["admin_level"="8"]->.searchArea;
    (
      way["highway"]["name"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${city}: ${res.statusText}`);
    }

    const json = await res.json();
    const fileName = `${city.toLowerCase().replace(/\s+/g, "_")}_streets.geojson`;
    fs.writeFileSync(fileName, JSON.stringify(json, null, 2));
    console.log(`✅ Saved: ${fileName}`);
  } catch (err) {
    console.error(`❌ Error for ${city}:`, err.message);
  }
}

(async () => {
  for (const city of cities) {
    await fetchStreets(city);
    await delay(1500); // Be polite to the API
  }

  console.log("🎉 Done fetching all 50 cities.");
})();
