#!/usr/bin/env node

const fs = require(`fs`)
const _ = require(`lodash`)
const { Player } = require(`midi-player-js`)
const blessed = require(`blessed`)
const contrib = require(`blessed-contrib`)
const Alea = require(`alea`)

const VOWELS = _.range(4)
const CONSONANTS = _.range(5, 29)
const VOICES = [`Soprano`, `Mezzo-Soprano`, `Tenor`, `Bass`]

const getCurrentPhoneme = (tick, collection) => {

  const prng = new Alea(tick)

  const tickValue = Math.round(prng() * 1000)

  return collection[tickValue % collection.length]
}

const player = new Player()

const inputFile = process.argv[2]

if (_.isEmpty(inputFile) || _.last(inputFile.split(`.`)) !== `mid`) {

  throw new Error(`Must provide a midi file.`)
}

player.loadFile(`./${inputFile}`)

const songTime = player.getSongTime()

const allEvents = player.getEvents()

const MAX_TICKS = _.last(_.maxBy(allEvents, (events) => _.last(events).tick)).tick

const noteEventsOnly = allEvents.map(track => track.filter(event => [`Note on`, `Note off`].includes(event.name))).filter(track => !_.isEmpty(track))

const timelines = noteEventsOnly.map((track, index) => {

  return {
    title: `Track ${index}`,
    x: track.map(event => event.tick),
    y: track.map(event => event.noteNumber),
    style: {
      line: _.times(3, () => Math.random() * 255)
    }
  }
})

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

  const parsedEvents = trackAssignments.map((trackIndex) => {

    const track = noteEventsOnly[parseInt(trackIndex, 10)]

    return track.reduce((memo, event) => {

      if (!event.velocity) {

        return memo
      }

      const timeSeconds = Math.abs((event.tick / MAX_TICKS) * songTime + (Math.random() * 0.025 * _.sample([1, -1])))

      memo.push({
        timeSeconds: timeSeconds,
        midiPitch: event.noteNumber,
        librettoChunk: {
          vowel: {
            name: getCurrentPhoneme(event.tick, VOWELS),
            duration: 0.20000000298023224
          },
          suffix: [
            {
              name: getCurrentPhoneme(event.tick, CONSONANTS),
              duration: 0.10000000149011612
            }
          ]
        }
      })

      return memo
    }, [])
  }).map((track) => {

    return {
      notes: track,
      startSuffix: [
        {
          name: _.sample(CONSONANTS),
          duration: 0.10000000149011612
        }
      ]
    }
  })

  const song = {
    theme: 1,
    parts: parsedEvents
  }

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
