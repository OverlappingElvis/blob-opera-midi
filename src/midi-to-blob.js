const Alea = require(`alea`)
const _ = require(`lodash`)

const VOWELS = _.range(4)
const CONSONANTS = _.range(5, 29)

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

  convert (trackAssignments = [0, 1, 2, 3], christmas = true, random = false) {

    const noteEvents = this.getNoteEvents()
    const maxTicks = this.getMaxTicks()
    const songTime = this.getSongTime()

    const parts = trackAssignments.map((trackIndex) => {

      const track = noteEvents[trackIndex]

      return track.reduce((memo, event, index, allEvents) => {

        const nextEvent = _.get(allEvents, index + 1)

        const offset = random ? (Math.random() * 0.025 * _.sample([1, -1])) : 0

        const offsetTimeSeconds = (event.tick / maxTicks) * songTime + offset

        const timeSeconds = event.tick > 0 ? offsetTimeSeconds : Math.abs(offsetTimeSeconds)

        if (!event.velocity || event.name === `Note off`) {

          if (nextEvent && nextEvent.delta > 800) {

            memo.push({
              timeSeconds: timeSeconds + 0.5,
              midiPitch: event.noteNumber,
              librettoChunk: {
                vowel: {
                  name: 4,
                  duration: DEFAULT_VOWEL_DURATION
                },
                suffix: [{
                  name: this.getCurrentPhoneme(event, CONSONANTS),
                  duration: DEFAULT_CONSONANT_DURATION
                }]
              },
              controlled: false
            })
          }

          return memo
        }

        let duration = DEFAULT_VOWEL_DURATION

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
          },
          controlled: true
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
