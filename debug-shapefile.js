const shapefile = require('shapefile');

(async () => {
  const source = await shapefile.open(
    './ontario-shapefile/gis_osm_roads_free_1.shp',
    './ontario-shapefile/gis_osm_roads_free_1.dbf'
  );

  let count = 0;

  while (true) {
    const result = await source.read();
    if (result.done || count > 100) break;

    const props = result.value.properties;
    const name = props.name || '';
    const city = props['addr:city'] || props['is_in'] || '';
    
    if (name) {
      console.log(`${++count}: ${name} — city: "${city}"`);
    }
  }
})();
