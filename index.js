#!/usr/bin/env node

const fs = require(`fs`)
const _ = require(`lodash`)
const { Player } = require(`midi-player-js`)
const blessed = require(`blessed`)
const contrib = require(`blessed-contrib`)
const { program } = require(`commander`)

program.version(`1.0.4`)
.option(`-i --interactive`, `run in interactive mode`)
.option(`-c --christmas`, `christmas blobs mode`)
.option(`-r --random`, `add timing drift`)
.option(`-f --free-pitch`, `don't lock midi pitches to singable range`)

program.parse(process.argv)

const MidiToBlob = require(`./src/midi-to-blob`)

const inputFile = program.args[0]

if (_.isEmpty(inputFile) || _.last(inputFile.split(`.`)) !== `mid`) {

  throw new Error(`Must provide a midi file.`)
}

const VOICES = [`Soprano`, `Mezzo-Soprano`, `Tenor`, `Bass`]

const player = new Player()
const converter = new MidiToBlob(player)

player.loadFile(`./${inputFile}`)

const trackAssignments = [0, 1, 2, 3]

if (!program.interactive) {

  const song = converter.convert(trackAssignments, program.christmas, program.random, program.freePitch)

  return fs.writeFile(`${inputFile}.json`, JSON.stringify(song), () => {

    console.log(`Wrote song to ${inputFile}.json`)

    process.exit(0)
  })
}

const timelines = converter.getTrackTimelines()

const screen = blessed.screen()
const grid = new contrib.grid({
  rows: 8,
  cols: 2,
  screen: screen
})

const trackList = grid.set(0, 0, 3, 1, contrib.table, {
  keys: true,
  columnWidth: [14, 8]
})

const line = grid.set(0, 1, 3, 1, contrib.line, {
  showLegend: true
})

const log = grid.set(4, 0, 1, 1, contrib.log)

const save = grid.set(4, 1, 1, 1, blessed.button, {
  mouse: true,
  content: `Export`
})

const defaultExportCallback = () => {

  log.log(`Wrote song to ${inputFile}.json`)

  screen.render()
}

const exportSong = (callback = defaultExportCallback) => {

  const song = converter.convert(trackAssignments, program.christmas, program.random, program.freePitch)

  fs.writeFile(`${inputFile}.json`, JSON.stringify(song), callback)
}

save.on(`press`, () => exportSong())

line.setData(timelines)

screen.key([`escape`, `q`, `C-c`], () => process.exit(0))

screen.key([`C-e`], () => exportSong(() => process.exit(0)))

trackList.focus()

const setTracklistData = () => {

  trackList.setData({
    headers: [`Part`, `Track`],
    data: VOICES.map((val, index) => [val, trackAssignments[index]])
  })
}

setTracklistData()

trackList.rows.on(`select`, function(event) {

  let prompt = blessed.prompt({
    left: `center`,
    top: `center`,
    height: `shrink`,
    width: `shrink`,
    border: `line`
  })

  screen.append(prompt)

  prompt.input(`Set track number`, ``, (err, value) => {

    log.log(`Assigning track ${value} to ${VOICES[event.index - 2]}`)

    trackAssignments[event.index - 2] = value

    prompt = null

    setTracklistData()

    screen.render()
  })
})

log.log(`Started MIDI to Blob Opera.`)

screen.render()
