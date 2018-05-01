const sqlite3 = require('sqlite3').verbose()
const tilebelt = require('@mapbox/tilebelt')
const MBTiles = require('@mapbox/mbtiles')
const path = require('path')

if (process.argv.length < 3) {
  console.log('usage: node mbstitch.js target.mbtiles source1.mbtiles...')
  process.exit()
}

new MBTiles(`${process.argv[2]}?mode=rwc`, (err, mbtiles) => {})

for (let i = 3; i < process.argv.length; i++) {
  const mbpath = process.argv[i]
  let Z, X, Y
  [Z, X, Y] = path.basename(mbpath, '.mbtiles').split('-').
    map(v => {return parseInt(v)})
  console.log([Z, X, Y])
  const db = new sqlite3.Database(mbpath, sqlite3.OPEN_READONLY)
  db.close
}
