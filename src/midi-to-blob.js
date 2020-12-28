const Alea = require(`alea`)
const _ = require(`lodash`)

const VOWELS = _.range(4)
const CONSONANTS = _.range(5, 29)

const TRACK_ASSIGNMENTS = _.range(4)

const DEFAULT_VOWEL_DURATION = 0.20000000298023224
const DEFAULT_CONSONANT_DURATION = 0.10000000149011612

class MidiToBlob {

  constructor (player) {

    this.player = player
  }

  getCurrentPhoneme ({ tick }, collection) {

    const prng = new Alea(tick)

    const tickValue = Math.round(prng() * 1000)

    return collection[tickValue % collection.length]
  }

  getMaxTicks () {

    const allEvents = this.player.getEvents()

    return _.last(_.maxBy(allEvents, (events) => _.last(events).tick)).tick
  }

  getNoteEvents () {

    return this.player.getEvents()
    .map(track => track.filter(event => [`Note on`, `Note off`].includes(event.name)))
    .filter(track => !_.isEmpty(track))
  }

  getSongTime () {

    return this.player.getSongTime()
  }

  getTrackTimelines () {

    return this.getNoteEvents()
    .map((track, index) => {

      return {
        title: `Track ${index}`,
        x: track.map(event => event.tick),
        y: track.map(event => event.noteNumber),
        style: {
          line: _.times(3, () => Math.random() * 255)
        }
      }
    })
  }

  convert (trackAssignments = [0, 1, 2, 3], christmas = true) {

    const noteEvents = this.getNoteEvents()
    const maxTicks = this.getMaxTicks()
    const songTime = this.getSongTime()

    const parts = trackAssignments.map((trackIndex) => {

      const track = noteEvents[trackIndex]

      return track.reduce((memo, event, index, allEvents) => {

        if (!event.velocity) {

          return memo
        }

        const timeSeconds = Math.abs((event.tick / maxTicks) * songTime + (Math.random() * 0.025 * _.sample([1, -1])))

        let duration = DEFAULT_VOWEL_DURATION

        const nextEvent = _.get(allEvents, index + 1)

        if (nextEvent) {

          duration = Math.min(((nextEvent.delta / maxTicks) * songTime) / 2, DEFAULT_VOWEL_DURATION)
        }

        memo.push({
          timeSeconds,
          midiPitch: event.noteNumber,
          librettoChunk: {
            vowel: {
              name: this.getCurrentPhoneme(event, VOWELS),
              duration: duration
            },
            suffix: [{
              name: this.getCurrentPhoneme(event, CONSONANTS),
              duration: DEFAULT_CONSONANT_DURATION
            }]
          }
        })

        return memo
      }, [])
    })
    .map((notes) => {

      return {
        notes,
        startSuffix: [
          {
            name: this.getCurrentPhoneme({ tick: 0 }, CONSONANTS),
            duration: DEFAULT_CONSONANT_DURATION
          }
        ]
      }
    })

    return {
      theme: christmas ? 1 : 0,
      parts
    }
  }
}

module.exports = MidiToBlob
