# blob-opera-midi

Quick and dirty tool to convert 4-part MIDI arrangments to [Blob Opera](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw) format JSON.

## Background

https://twitter.com/Overlapping/status/1338979256903208960

## Installation

`$ npm install -g blob-opera-midi`

## Usage

If your MIDI file is already exactly 4 tracks in SATB order:
- `$ blob-opera-midi song.mid`
- JSON file will be outputted to `<filename>.mid.json`

If your MIDI is not in track order or you want to preview the track assignments:
- `$ blob-opera-midi song.mid -i` or `$ blob-opera-midi song.mid --interactive`
- Arrow keys to select parts to map, enter to bring up a dialog with a number input corresponding to MIDI tracks from track graph on right, click (yes, with your mouse) the export button, then `esc` or `q` to exit.
- JSON file will be exported as `<filename>.mid.json`.

Add the `--christmas` flag to put Santa hats on the blobs.

See the [excellent instructions](https://github.com/0x2b3bfa0/blob-opera#testing) by [0x2b3bfa0](https://github.com/0x2b3bfa0) on how to sideload your JSON file.

You can also save your sideloaded song to a [shareable URL](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw?cp=eyJyIjoiS0JPbTd4amd4eTRkIn0.) by encoding it using `te.RecordingMessage.encode(<JSON>).finish()` at line 9428 of the main app file:

![Screenshot of Chrome dev tools with a breakpoint set on line 9428 of prettified app source](https://i.imgur.com/Vyp9Pdv.png)

## Objections

### But isn't this really hacky?

Yes.

### Can't you just control the Blob Opera directly with MIDI signals?

Yes, but that's not interesting to me and this has advantages over that like temporally consistent vocalizations without having to do any manual programming.

### There's something wrong with the timing!

Probably. Submit a github issue!
