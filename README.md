# blob-opera-midi

## Background

https://twitter.com/Overlapping/status/1338979256903208960

## Installation

`$ npm install -g blob-opera-midi`

## Usage

Run with `blob-opera-midi song.mid`. Arrow keys to select parts to map, enter to bring up a dialog with a number input corresponding to MIDI tracks from track graph on right, click (yes, with your mouse) the export button, then `esc` or `q` to exit. Note that many SATB arrangements are already ordered correctly, so if the default looks correct you can just click export. File will be exported as `<filename>.mid.json`. Follow the instructions in https://twitter.com/Overlapping/status/1338979945792466944 to sideload the JSON file.

## Objections

### But isn't this really hacky?

Yes.

### Can't you just control the Blob Opera directly with MIDI signals?

Yes, but that's not interesting to me and this has advantages over that like temporally consistent vocalizations without having to do any manual programming.

### There's something wrong with the timing!

Probably. Submit a github issue!
