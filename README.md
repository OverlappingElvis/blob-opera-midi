# blob-opera-midi

Quick and dirty tool to convert 4-part MIDI arrangements to [Blob Opera](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw) format JSON.

## Background

[Blob Opera](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw) is a "machine learning experiment by David Li in collaboration with Google Arts & Culture", allowing users to "[create their] own opera inspired song with Blob Opera - no music skills required".

It's definitely worth playing with the Blob Opera before using this tool. The musical toy can be controlled by dragging the blobs with your mouse or, if you have one connected, a MIDI input device like a keyboard or sequencer. Both of these methods have limitations. Mouse control is imprecise and only affects one voice at a time with no manual harmony. MIDI control can be used to play the blobs like an organ but cannot control individual voices as a range of absolute MIDI pitches is assigned to each blob, making complex arrangements difficult. To enable the blobs to sing arbitrary choral (SATB) arrangements I wrote a tool that converts multitrack MIDI files into the file format used by the blobs to play included example songs, and found a method to cause the blobs to load my file instead of the expected example file.

Here are some of my results (Twitter video links):
- [Here's to the Night, by Eve 6](https://twitter.com/Overlapping/status/1349549691948548096) (stable code)
- [Hide and Seek, by Imogen Heap](https://twitter.com/Overlapping/status/1346698613536092163/video/1) (stable code)
- [All Star (Bach Chorale Version), by Smash Mouth](https://twitter.com/Overlapping/status/1343308592066088961/video/1) (stable code)
- [Ne Irascaris Domine, by William Byrd](https://twitter.com/Overlapping/status/1340073304812527616/video/1) (original proof of concept code)
- [Canon in D](https://twitter.com/Overlapping/status/1339084156731441154/video/1) (original proof of concept code)


## Installation

`$ npm install -g blob-opera-midi`

## Usage

### Converting the MIDI file

If your MIDI file is already exactly 4 tracks in SATB order:
- `$ blob-opera-midi song.mid`
- JSON file will be output to `<filename>.mid.json`

If your MIDI is not in track order or you want to preview the track assignments:
- `$ blob-opera-midi song.mid -i` or `$ blob-opera-midi song.mid --interactive`
- Arrow keys to select parts to map, enter to bring up a dialog with a number input corresponding to MIDI tracks from track graph on right, click (yes, with your mouse) the export button, then `esc` or `q` to exit. Alternatively, you can use the `ctrl-e` hotkey to export and immediately exit.
- JSON file will be exported as `<filename>.mid.json`.

Other command-line flags:
- `-r` or `--random` to add slight timing drift (may provide more naturalistic sound). By default, no drift is added.
- `-f` or `--free-pitch` to allow notes outside of the comfortable range of the blobs. By default, pitches are clamped between 48 and 70, although the actual note produced by a blob may be in a different octave depending on range.
- `-c` or `--christmas` to make the blobs wear santa hats (no effect when using Method 2 to load a song).

### Sideloading the JSON file

#### Method 1: Recording

1. Open the [Blob Opera][1] web page, preferably with Google Chrome.
2. [Open the developer tools][2]; usually by right-clicking anywhere and choosing **Inspect...**
3. Browse to the application source file (`app.js`) and [add a breakpoint][3] on the first line of this function:
   ```javascript
   t.prototype.finishRecording = function() {
              if (!this.isRecording) // ADD THE BREAKPOINT HERE
                  return null;
              var t = this.currentRecording;
              return function(t, e) {
                  for (var n = 1 / 0, i = 0, r = t.parts; i < r.length; i++) {
                      (l = r[i]).notes.length > 0 && (n = Math.min(n, l.notes[0].timeSeconds))
                  }
                  for (var o = e - n, a = 0, s = t.parts; a < s.length; a++)
                      for (var l, u = 0, c = (l = s[a]).notes; u < c.length; u++) {
                          c[u].timeSeconds += o
                      }
              }(t, .2),
              this.isRecording = !1,
              this.currentRecording = null,
              t
          }
   ```
4. Start a new recording by pressing the red button on the bottom-left corner and stop it again.
5. Now you've hit the breakpoint; type `this.currentRecording = <contents>` where `<contents>` should be replaced by the contents of the JSON file generated previously.
6. Resume the execution by clicking the play button on the debugger.
7. Wait a few seconds for the speed to stabilize and stop it.

#### Method 2 (deprecated): Load as holiday song

1. Follow steps 1-3 above, but instead set a breakpoint at 9939 (`e.opera.enterPlaying(n)`)
2. Click the holiday icon and select a song
3. Breakpoint should trigger. Type `n = <contents>` where `<contents>` is the contents of your JSON file.
4. Resume the execution by clicking the play button on the debugger.
5. Immediately click stop and wait for the speed to sync, then click play.

You can also save songs sideloaded with this method to a [shareable URL](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw?cp=eyJyIjoiS0JPbTd4amd4eTRkIn0) by encoding it using `te.RecordingMessage.encode(<JSON>).finish()` at line 9428 of the main app file:

![Screenshot of Chrome dev tools with a breakpoint set on line 9428 of prettified app source](https://i.imgur.com/Vyp9Pdv.png)

## Objections

### But isn't this really hacky?

Yes.

### Can't you just control the Blob Opera directly with MIDI signals?

Yes, but that's not interesting to me and this has advantages over that like temporally consistent vocalizations without having to do any manual programming.

### There's something wrong with the timing!

Probably. Submit a github issue!

## Related links

- [blob-opera-toolkit](https://github.com/0x2b3bfa0/blob-opera-toolkit) (python, supports MusicXML with real lyrics)
- [The Silvis Woodshed](http://gasilvis.net/) (MIDI scores for choral music, mostly in parts in SATB order)

[1]: https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw
[2]: https://developers.google.com/web/tools/chrome-devtools/open
[3]: https://developers.google.com/web/tools/chrome-devtools/javascript/breakpoints#loc
