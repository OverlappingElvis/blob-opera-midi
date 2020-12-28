#!/usr/bin/env node

const fs = require(`fs`)
const _ = require(`lodash`)
const { Player } = require(`midi-player-js`)
const blessed = require(`blessed`)
const contrib = require(`blessed-contrib`)

const MidiToBlob = require(`./src/midi-to-blob`)

const inputFile = process.argv[2]

if (_.isEmpty(inputFile) || _.last(inputFile.split(`.`)) !== `mid`) {

  throw new Error(`Must provide a midi file.`)
}

const VOICES = [`Soprano`, `Mezzo-Soprano`, `Tenor`, `Bass`]

const player = new Player()
const converter = new MidiToBlob(player)

player.loadFile(`./${inputFile}`)

const timelines = converter.getTrackTimelines()

const trackAssignments = [0, 1, 2, 3]

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

save.on(`press`, () => {

  const song = converter.convert(trackAssignments, false)

  fs.writeFile(`${inputFile}.json`, JSON.stringify(song), () => {

    log.log(`Wrote song to ${inputFile}.json`)

    screen.render()
  })
})

line.setData(timelines)

screen.key(['escape', 'q', 'C-c'], function(ch, key) {

  return process.exit(0);
})

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
