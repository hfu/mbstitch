const sqlite3 = require('sqlite3')
const tilebelt = require('@mapbox/tilebelt')

if (process.argv.length < 3) {
  console.log('usage: node mbstitch.js target.mbtiles source1.mbtiles...')
  process.exit()
}
