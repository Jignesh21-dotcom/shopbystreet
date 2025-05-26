const fs = require('fs');
const axios = require('axios');
const slugify = require('slugify');
const path = require('path');

// ✅ Utility functions
function toSlug(text) {
  return text.toLowerCase()
    .replace(/street/g, 'st')
    .replace(/avenue/g, 'ave')
    .replace(/road/g, 'rd')
    .replace(/drive/g, 'dr')
    .replace(/boulevard/g, 'blvd')
    .replace(/court/g, 'ct')
    .replace(/crescent/g, 'cres')
    .replace(/lane/g, 'ln')
    .replace(/trail/g, 'trl')
    .replace(/place/g, 'pl')
    .replace(/[.]/g, '')
    .replace(/'/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchStreetsFromOSM(townName) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';

  const query = `
    [out:json][timeout:25];
    (
      way["highway"]["name"]["is_in"~"${townName}", i];
      way["highway"]["name"]["addr:city"~"${townName}", i];
    );
    out geom;
  `;

  try {
    const response = await axios.post(overpassUrl, query, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.elements || [];
  } catch (error) {
    console.error(`❌ ${townName}: Failed to fetch from Overpass - ${error.message}`);
    return [];
  }
}


// ✅ Extract and format street data
function extractStreetRows(elements, town) {
  const seen = new Set();
  const rows = [];

  elements.forEach(el => {
    if (el.type !== 'way' || !el.tags?.name || !el.geometry) return;

    const name = el.tags.name.trim();
    const slug = toSlug(name);
    if (seen.has(slug)) return;
    seen.add(slug);

    const mid = el.geometry[Math.floor(el.geometry.length / 2)] || {};

    rows.push({
      id: '', // Leave blank for Supabase to auto-generate
      created_at: '', // Leave blank to auto-fill
      country: 'canada',
      province: 'ontario',
      city: town.name,
      city_id: town.city_id,
      name,
      slug,
      display_name: name,
      lat: mid.lat || '',
      lon: mid.lon || ''
    });
  });

  return rows;
}

// ✅ Save to CSV
function saveToCSV(townName, rows) {
  if (rows.length === 0) {
    console.log(`⚠️  ${townName}: No valid streets found`);
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')))
    .join('\n');

  const filePath = path.join(__dirname, 'street-csvs', `${toSlug(townName)}.csv`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);

  console.log(`✅ ${townName}: Saved ${rows.length} streets to ${filePath}`);
}

// ✅ TOWN LIST
const towns = [
  {
    "name":"kenora",
    "city_id":"7b7665f0-88f4-4d93-ae39-cb8bd8af67f1"
  },
  {
    "name":"killaloe, hagarty and richards",
    "city_id":"e7907ebf-df88-4f82-9dd7-db9b752da9d5"
  },
  {
    "name":"kincardine",
    "city_id":"ea64858a-229c-47e4-9eab-344a7e6839e9"
  },
  {
    "name":"king",
    "city_id":"f3b35b51-7dc3-4e52-87f4-b57bb7e563e5"
  },
  {
    "name":"kingsville",
    "city_id":"d7ff2ae9-26bd-40b2-89a6-fd3dc4f7e674"
  },
  {
    "name":"kirkland lake",
    "city_id":"0d84667a-5f8e-42b8-97ce-cc431b1b432e"
  },
  {
    "name":"komoka",
    "city_id":"fcc24391-643a-4acc-bb5a-ca58e520c7ae"
  },
  {
    "name":"laird",
    "city_id":"18b4db7d-6405-4d2c-b150-19aa54eb5bcb"
  },
  {
    "name":"lake of bays",
    "city_id":"71a484ac-f8f1-4a8b-b11e-41d6f86d431d"
  },
  {
    "name":"lakeshore",
    "city_id":"c9a38475-de49-4f5b-b23a-b6d17342bb4d"
  },
  {
    "name":"lambton shores",
    "city_id":"d7d81d16-8d0d-4dd2-8b61-8f93a2273ff4"
  },
  {
    "name":"lanark highlands",
    "city_id":"faea90d9-3998-4b35-bb21-85deae0bdacc"
  },
  {
    "name":"lappe",
    "city_id":"3f1a3df6-edb8-4f3d-a8e2-8c3b3ff3c755"
  },
  {
    "name":"lasalle",
    "city_id":"4a23f99a-190c-4466-841e-879b085c3067"
  },
  {
    "name":"laurentian hills",
    "city_id":"fe34316f-17e7-41c1-a9ca-ea2dd1ff1a21"
  },
  {
    "name":"laurentian valley",
    "city_id":"a0ebb669-0774-4dbd-b2da-b62714b865b4"
  },
  {
    "name":"leamington",
    "city_id":"1eb02262-0357-4a5a-a0d3-7bbc18069558"
  },
  {
    "name":"leeds and the thousand islands",
    "city_id":"572cc6b5-7408-4103-a518-6ef91729febf"
  },
  {
    "name":"lincoln",
    "city_id":"9326478c-306a-4526-99cf-1a0506418d8f"
  },
  {
    "name":"london",
    "city_id":"1723e77f-1862-4b03-8c14-0733d128e273"
  },
  {
    "name":"loyalist",
    "city_id":"235c088e-4c4d-4f70-bd6f-d19e4560ca56"
  },
  {
    "name":"lucan biddulph",
    "city_id":"47259d45-d702-4e71-81d2-ac3ca223eeef"
  },
  {
    "name":"macdonald, meredith and aberdeen additional",
    "city_id":"e9b46820-68d3-46b4-9e9e-c21ed0ccb592"
  },
  {
    "name":"madawaska valley",
    "city_id":"494a425c-5a8d-4178-8e15-0781d4c494fa"
  },
  {
    "name":"madoc",
    "city_id":"b359247f-1a86-47a7-ba01-36e2473bd154"
  },
  {
    "name":"magnetawan",
    "city_id":"279b7764-421f-49c3-8788-44ed8747888a"
  },
  {
    "name":"malahide",
    "city_id":"d3983bdf-2d55-4f72-ae6e-4df97d6d2e26"
  },
  {
    "name":"mapleton",
    "city_id":"1de24ff8-7599-4c25-8ccf-e9533503ef02"
  },
  {
    "name":"marathon",
    "city_id":"8e43b933-2dc3-4d76-adc4-b823dd03be10"
  },
  {
    "name":"markham",
    "city_id":"b1987303-67f2-44d8-beb4-f01ca220c3f3"
  },
  {
    "name":"markstay",
    "city_id":"0a8a9490-78a4-4ff8-8b9d-4dff7120f412"
  },
  {
    "name":"marmora and lake",
    "city_id":"6585c021-45f4-41f7-bfa9-a91f2b9ee4b2"
  },
  {
    "name":"mattawa",
    "city_id":"80097f62-5d55-4954-a030-23cd51097902"
  },
  {
    "name":"mcdougall",
    "city_id":"0b1619f9-ef54-479f-b9c7-109e43dfe2f6"
  },
  {
    "name":"mckellar",
    "city_id":"995ec2ea-7924-4e82-8313-b025fa21fb4c"
  },
  {
    "name":"mcnab\/braeside",
    "city_id":"e18da9f1-dfcf-48ae-87f8-8e7ce2e0bf9c"
  },
  {
    "name":"meaford",
    "city_id":"fdb59568-ef8e-4fda-b58d-cc81accb9c5c"
  },
  {
    "name":"melancthon",
    "city_id":"a3496e79-0fe7-4917-8c0e-56508d7c5e2f"
  },
  {
    "name":"merrickville",
    "city_id":"9100facb-4a7d-41e5-b817-3acbca213af9"
  },
  {
    "name":"middlesex centre",
    "city_id":"64be54d6-deca-4651-afc9-516afb2be125"
  },
  {
    "name":"midland",
    "city_id":"31676fb0-a936-44ca-b5d0-e0c3b5584a48"
  },
  {
    "name":"milton",
    "city_id":"95c51963-f499-4602-ac5c-9a71b7ffeb71"
  },
  {
    "name":"minto",
    "city_id":"e6145a9b-e681-4406-98a9-37d5282b55d7"
  },
  {
    "name":"mono",
    "city_id":"a4dd7e50-aeac-4a43-bf26-54fb513eab21"
  },
  {
    "name":"montague",
    "city_id":"2e7f969e-9fa2-4412-b5ab-db73e239155f"
  },
  {
    "name":"moonbeam",
    "city_id":"9fa53337-9551-467b-9cee-f8a85be21d5e"
  },
  {
    "name":"morris-turnberry",
    "city_id":"bd548899-5a0a-4776-801c-a9c7d0ef4974"
  },
  {
    "name":"mulmur",
    "city_id":"8c849ea8-4ace-4415-969a-a7ed26568f5c"
  },
  {
    "name":"muskoka falls",
    "city_id":"407e9f3e-038e-4e65-9bc1-b281a709eef7"
  },
  {
    "name":"neebing",
    "city_id":"04ee76af-c27e-40be-93d3-0956140e0bdc"
  },
  {
    "name":"new tecumseth",
    "city_id":"5131e072-807e-434e-b0b8-48a24aaef6f8"
  },
  {
    "name":"newmarket",
    "city_id":"d8df892b-c195-4d78-a692-5a014d68fb30"
  },
  {
    "name":"niagara falls",
    "city_id":"c46d46e6-fb8d-4bbd-af7e-ba39ee49896f"
  },
  {
    "name":"niagara-on-the-lake",
    "city_id":"00876a7a-7483-4eae-9dfa-1c7618e44133"
  },
  {
    "name":"nipigon",
    "city_id":"1f8806a7-4876-4b95-8830-e1dc0db795f4"
  },
  {
    "name":"nipissing",
    "city_id":"4846a138-e910-4456-b83b-b5088220b149"
  },
  {
    "name":"north algona wilberforce",
    "city_id":"a9711e4a-bf86-4788-8de3-2f5bbbf6829b"
  },
  {
    "name":"north bay",
    "city_id":"b70d5526-681f-494a-b925-71cd67a068db"
  },
  {
    "name":"north dumfries",
    "city_id":"13c5abfd-aff3-4ed0-adbd-cf99828c898b"
  },
  {
    "name":"north dundas",
    "city_id":"7a752265-f1a0-489e-84f1-15f52aac90f4"
  },
  {
    "name":"north glengarry",
    "city_id":"0b9f64a9-7e67-461c-9b9e-d0dbc5b02a03"
  },
  {
    "name":"north grenville",
    "city_id":"a99d2b6a-776e-480f-8a6c-891508136fbd"
  },
  {
    "name":"north huron",
    "city_id":"ae510df2-69ff-4f1f-b0ca-f0307166f161"
  },
  {
    "name":"north kawartha",
    "city_id":"687ad310-28f9-4658-88fa-4d41fe730769"
  },
  {
    "name":"north middlesex",
    "city_id":"8b961331-e207-45c8-aacf-3de3cfba912c"
  },
  {
    "name":"north perth",
    "city_id":"b8ca8613-e09b-47fe-b6fc-c4a3c26b08b0"
  },
  {
    "name":"north stormont",
    "city_id":"3e411ffd-828b-4888-b08e-2e66ae199af3"
  },
  {
    "name":"northeastern manitoulin and the islands",
    "city_id":"2b1d2c7e-2682-4214-b4eb-011133cdbe95"
  },
  {
    "name":"norwich",
    "city_id":"b76c0991-9e50-407e-9c60-1288ee247d91"
  },
  {
    "name":"oakville",
    "city_id":"4d9d759d-0450-4e54-b4ca-24752fde9938"
  },
  {
    "name":"orangeville",
    "city_id":"eb83e229-c02c-4472-945c-f57d61089bea"
  },
  {
    "name":"orillia",
    "city_id":"5f60e8f6-e426-47ba-87eb-901f741399bf"
  },
  {
    "name":"oro-medonte",
    "city_id":"f87f001c-f9e8-4db9-aa41-558d51ed3d0e"
  },
  {
    "name":"oshawa",
    "city_id":"2c2f0212-79af-4d59-b428-e12535edda4c"
  },
  {
    "name":"otonabee-south monaghan",
    "city_id":"5ebad547-9698-4120-9a30-60c737df4b32"
  },
  {
    "name":"ottawa",
    "city_id":"9819bf53-dde0-419c-a87b-0eb4b00f4ead"
  },
  {
    "name":"owen sound",
    "city_id":"4739cbe0-d552-4b7d-9192-4f88eb4c05ec"
  },
  {
    "name":"papineau-cameron",
    "city_id":"bbee4866-4f5b-40f5-a983-c8c6ed61bd4f"
  },
  {
    "name":"parry sound",
    "city_id":"9cf77d84-f7ea-4b7c-92ca-af68cd3caa9c"
  },
  {
    "name":"pelham",
    "city_id":"31e1ce5c-396b-4c39-aab8-f2d893cb32c6"
  },
  {
    "name":"pembroke",
    "city_id":"9af1784d-a811-472d-b986-d8aa06bf8a05"
  },
  {
    "name":"perry",
    "city_id":"e9a1d5cd-85b3-44c7-8449-20a38d9c3926"
  },
  {
    "name":"perth",
    "city_id":"a607a256-c05a-4130-8e94-55ad46c823d7"
  },
  {
    "name":"perth east",
    "city_id":"f70ae7c8-404f-4f42-acdf-e3237385466d"
  },
  {
    "name":"perth south",
    "city_id":"d464012f-16ef-4d1f-9ba1-07c922685f25"
  },
  {
    "name":"petawawa",
    "city_id":"8ea25105-22b1-4e37-a1a2-2f0abaee3464"
  },
  {
    "name":"peterborough",
    "city_id":"eed01a6e-51c0-4e51-90c5-66edc07605cf"
  },
  {
    "name":"petrolia",
    "city_id":"89c71837-e656-40df-a169-f01bb22266b3"
  },
  {
    "name":"pickering",
    "city_id":"43a90ef6-b8ce-47a2-b5df-48daf371767d"
  },
  {
    "name":"point edward",
    "city_id":"d8ee97c3-7149-4054-b035-60e19c227f9d"
  },
  {
    "name":"port colborne",
    "city_id":"a4ee6851-17cf-4837-9ad7-fc03842162e4"
  },
  {
    "name":"port hope",
    "city_id":"18c53bec-9743-4434-a8e9-26fa732e1e04"
  },
  {
    "name":"powassan",
    "city_id":"8d63f2be-d4ec-4916-ab39-a151989ab919"
  },
  {
    "name":"prescott",
    "city_id":"ec34f759-cf63-441c-add4-a0acdff1d73d"
  },
  {
    "name":"prince",
    "city_id":"8ac665e4-291d-46d6-bbbb-54a22fd83de5"
  },
  {
    "name":"puslinch",
    "city_id":"c11ba8b5-784d-4703-a17f-e1b3182604ca"
  },
  {
    "name":"quinte west",
    "city_id":"e2638bbb-881d-4245-8946-cf047297208b"
  },
  {
    "name":"ramara",
    "city_id":"64ba644e-b971-4d13-b629-0e569e2b1000"
  },
  {
    "name":"red lake",
    "city_id":"6a3ee878-1c30-4922-95d7-027689b4fef4"
  },
  {
    "name":"renfrew",
    "city_id":"d7ebb05b-5828-41bc-8ac5-e6a4d17fb269"
  },
  {
    "name":"rideau lakes",
    "city_id":"e37c1227-d876-4fe8-86c3-363348cbd57c"
  },
  {
    "name":"russell",
    "city_id":"938a2fd9-0949-4c55-b596-60d757cbd6c9"
  },
  {
    "name":"sables-spanish rivers",
    "city_id":"29f9f806-88da-4044-b76c-c13fb5eb2208"
  },
  {
    "name":"sagamok",
    "city_id":"b8d1a903-b190-43f0-9f52-b1a953d9c2ec"
  },
  {
    "name":"sarnia",
    "city_id":"e482ac83-0625-4c9f-b52f-6a13ed43a172"
  },
  {
    "name":"saugeen shores",
    "city_id":"c7343ed1-68af-4283-b7fd-b9624f40cc7a"
  },
  {
    "name":"sault ste. marie",
    "city_id":"49edb9d8-dce4-4898-a08b-049da1deb8ff"
  },
  {
    "name":"schreiber",
    "city_id":"1ec7b117-3b9f-481e-a4f3-c3ccfc5b16ce"
  },
  {
    "name":"scugog",
    "city_id":"fd5a238d-4ad3-4b94-b7ca-b3f9be7f377b"
  },
  {
    "name":"seguin",
    "city_id":"d8d08289-4fe3-4dee-9b9b-3e5e98305267"
  },
  {
    "name":"selwyn",
    "city_id":"d3584049-dfad-4406-b8a7-e596ce723d9c"
  },
  {
    "name":"severn",
    "city_id":"83094d69-ced6-40f6-85c0-1f2e98d98121"
  },
  {
    "name":"shelburne",
    "city_id":"366819a0-a3e6-41d3-8a10-56adfa2c4582"
  },
  {
    "name":"shuniah",
    "city_id":"20e5b326-d9d1-4b7b-84a8-9da17279346e"
  },
  {
    "name":"sioux lookout",
    "city_id":"101f8cc7-29df-443a-89fa-cbe21da5d446"
  },
  {
    "name":"sioux narrows-nestor falls",
    "city_id":"0d867925-6e8f-43c6-8c1b-c0061252a241"
  },
  {
    "name":"smooth rock falls",
    "city_id":"6346a178-8502-4550-bf70-06f5b61c9d27"
  },
  {
    "name":"south algonquin",
    "city_id":"c43d6db3-fe23-4803-9496-d7201e3fa2b9"
  },
  {
    "name":"south bruce",
    "city_id":"518cc15a-7d78-4f28-b4be-cb15d3531434"
  },
  {
    "name":"south dundas",
    "city_id":"428da767-20d2-4ffc-af51-c1f5a6828ffc"
  },
  {
    "name":"south frontenac",
    "city_id":"c23f5e31-ba39-4cc2-a2bb-8bcc91c31f29"
  },
  {
    "name":"south glengarry",
    "city_id":"456884f2-54ce-4a7e-b0d2-41c86a5c7f68"
  },
  {
    "name":"south huron",
    "city_id":"7ebd6e53-f4df-46bf-a41e-7df4483f6897"
  },
  {
    "name":"south river",
    "city_id":"f97e18d7-dfac-47cc-b620-a81a685d239d"
  },
  {
    "name":"south stormont",
    "city_id":"aa3575a3-ad91-43b8-80e1-0d565b82106d"
  },
  {
    "name":"south-west oxford",
    "city_id":"32c50629-29a1-4b06-852e-bb6fa521c1b9"
  },
  {
    "name":"southgate",
    "city_id":"df050ed8-dfbb-493a-bc14-4f8729a463a0"
  },
  {
    "name":"southwest middlesex",
    "city_id":"3b1bb125-9399-4f1a-8f84-faa11954d4c5"
  },
  {
    "name":"southwold",
    "city_id":"c8a96ded-d884-429a-9b8b-4c976a94340f"
  },
  {
    "name":"springwater",
    "city_id":"a20ae29e-ea38-4c99-8db8-6fded73e2b06"
  },
  {
    "name":"stirling-rawdon",
    "city_id":"0a3d89fe-1868-4705-a304-7fd6299e9194"
  },
  {
    "name":"stone mills",
    "city_id":"d16a85d5-f9a5-41f2-bbc6-95c92e2ae2ca"
  },
  {
    "name":"stratford",
    "city_id":"f6d87c6d-0334-4f59-b8e0-6ec85d6633f1"
  },
  {
    "name":"strong",
    "city_id":"0cc6f876-95fa-48c6-8b74-f18976b69eb6"
  },
  {
    "name":"sudbury",
    "city_id":"681a9b1c-6fd8-41da-a509-98134df1451f"
  },
  {
    "name":"tara",
    "city_id":"a31405a0-5885-4d50-bc94-4914de480c2f"
  },
  {
    "name":"tay",
    "city_id":"22473c9d-277b-4863-bf53-7b0dbc1346fd"
  },
  {
    "name":"tay valley",
    "city_id":"22e27a32-09e0-4bca-8795-e35cbd654464"
  },
  {
    "name":"tecumseh",
    "city_id":"a2cabe8f-361f-423a-82f1-d4bc1c1281bd"
  },
  {
    "name":"temiskaming shores",
    "city_id":"e269df57-0871-4870-bc38-8d13f7928fad"
  },
  {
    "name":"thames centre",
    "city_id":"b583fd82-e8f2-463d-a28b-8a808c1acff2"
  },
  {
    "name":"the blue mountains",
    "city_id":"4b1db82d-1f1f-45f0-8b08-9fb32d3769fe"
  },
  {
    "name":"thessalon",
    "city_id":"97aabc68-dc6d-4a23-8dfe-0e23e457c716"
  },
  {
    "name":"thorold",
    "city_id":"2346b234-ba48-4ef6-8711-a3e05bf1175f"
  },
  {
    "name":"thunder bay",
    "city_id":"bd898c34-6915-4228-87d8-bb2f51d1feca"
  },
  {
    "name":"tillsonburg",
    "city_id":"8a4ac999-719a-4102-a4c7-c24088a39a39"
  },
  {
    "name":"tiny",
    "city_id":"37fc33ed-9cc3-4f11-86d0-390e06b42b63"
  },
  {
    "name":"trent hills",
    "city_id":"20dcc625-6839-4c7d-93c6-ba7568b537eb"
  },
  {
    "name":"trent lakes",
    "city_id":"6b579875-1266-452e-82b2-5387356f7c52"
  },
  {
    "name":"tweed",
    "city_id":"f5531db3-7b12-4d15-90a4-c17ae879d39e"
  },
  {
    "name":"tyendinaga",
    "city_id":"63652312-0c9f-4a8c-ad53-de3c0cb8bc3f"
  },
  {
    "name":"uxbridge",
    "city_id":"1cb6fb53-ec12-4726-8200-9ad68f965081"
  },
  {
    "name":"vaughan",
    "city_id":"a76f4055-6211-4fd3-b7b6-9e43de0a668a"
  },
  {
    "name":"wainfleet",
    "city_id":"305cd63e-0ccc-4b0c-b97e-cbd3f950e628"
  },
  {
    "name":"warwick",
    "city_id":"a34b929e-080d-4660-9b7d-d1511066f70e"
  },
  {
    "name":"wasaga beach",
    "city_id":"1615870d-d03f-488b-8112-2fd4b80be209"
  },
  {
    "name":"waterloo",
    "city_id":"5b1183ab-3845-4232-941b-b03d47b76d99"
  },
  {
    "name":"wawa",
    "city_id":"87a0fce7-22ca-466f-8db5-485a3f637d45"
  },
  {
    "name":"wellesley",
    "city_id":"623ce870-8626-4e04-8bad-1fe6b85574dd"
  },
  {
    "name":"wellington",
    "city_id":"ec8f9def-c208-408c-aa4a-793ce845f8bb"
  },
  {
    "name":"wellington north",
    "city_id":"4d8d5882-5843-4f6d-8f37-93ff478e418d"
  },
  {
    "name":"west elgin",
    "city_id":"a4e76616-5975-4c52-a075-18d5291a5d57"
  },
  {
    "name":"west grey",
    "city_id":"72f22410-eaa1-428c-97d4-b64dfa52c9e6"
  },
  {
    "name":"west lincoln",
    "city_id":"d99b003d-8b47-4b23-9efd-8045c4db0b81"
  },
  {
    "name":"west perth",
    "city_id":"1730de4c-4e58-4531-aa4e-5d1f9d74927e"
  },
  {
    "name":"whitby",
    "city_id":"13d00943-4c67-4eb4-b134-87a31046a3c5"
  },
  {
    "name":"whitewater region",
    "city_id":"8adb112d-5f72-4550-941d-e8082ac3176c"
  },
  {
    "name":"wilmot",
    "city_id":"aa4891b2-c6d0-4094-a0bc-f43dc13f3aa3"
  },
  {
    "name":"windsor",
    "city_id":"8cf59ce0-47f2-49c5-9fd4-9006482bbc3c"
  },
  {
    "name":"woodstock",
    "city_id":"6b3ce853-6eaa-434e-9975-913a2a307271"
  },
  {
    "name":"woolwich",
    "city_id":"316ec816-2315-40d0-aa0a-ea17892d77f4"
  }
];

(async () => {
  for (const town of towns) {
    console.log(`🔄 Processing: ${town.name}`);
    const elements = await fetchStreetsFromOSM(town.name);
    console.log(`📊 ${town.name}: ${elements.length} raw elements fetched`);

    const rows = extractStreetRows(elements, town);
    saveToCSV(town.name, rows);

    await sleep(1000); // ⏱️ Prevent rate-limiting
  }

  console.log('🎉 Done generating CSVs.');
})();
