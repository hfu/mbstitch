const Database = require('better-sqlite3')
const MBTiles = require('@mapbox/mbtiles')
const path = require('path')

if (process.argv.length < 3) {
  console.log('usage: node mbstitch.js target.mbtiles source1.mbtiles...')
  process.exit()
}

new MBTiles(`${process.argv[2]}?mode=rwc`, (err, mbtiles) => {
  if (err) { 
    console.log(err) 
  } else {
    mbtiles.startWriting(err => {
      if (err) {
        console.log(err)
      } else {
        stitchTo(mbtiles)
      }
    })
  }
})

const stitchTo = mbtiles => {
  const g = function* gfn(mbtiles) {
    for (let i = 3; i < process.argv.length; i++) {
      const mbpath = process.argv[i]
      let Z, X, Y
      [Z, X, Y] = path.basename(mbpath, '.mbtiles').split('-').
        map(v => {return parseInt(v)})
      console.log([Z, X, Y])
      const db = new Database(mbpath, {readonly: true})
      const stmt = db.prepare('SELECT * FROM tiles')
      for (let row of stmt.iterate()) {
        const z = row.zoom_level
        const x = row.tile_column
        const y = (1 << z) - row.tile_row - 1
        const data = row.tile_data
        if (x >> (z - Z) === X && y >> (z - Z) === Y) {
          yield {z: z, x: x, y: y, data: data}
        }
      } 
      db.close
      if (i === process.argv.length - 1) {
        mbtiles.stopWriting(err => {
          if (err) console.log(err)
          console.log(`${count} (finished)`)
        })
      }
    }
  }(mbtiles)
  let count = 0
  const put = (v) => {
    if(v.done) {
    } else {
      // console.log(v.value.data)
      mbtiles.putTile(v.value.z, v.value.x, v.value.y, v.value.data, err => {
        if (err) console.log(err)
        count += 1
        if (count % 10000 === 0) console.log(count)
        put(g.next())
      })
    }
  }
  put(g.next())
}
