import { Clef, Interval, Key } from "./core";
import { Exercise, Voice, VoicePosition } from "./counterpoint";

describe("Parallel octaves", () => {
    it("should detect parallel octaves", () => {
        const exercise = new Exercise(
            Key.c,
            new Voice(VoicePosition.bottom, Clef.bass, "e3 g3 b3 a3", true),
            new Voice(VoicePosition.top, Clef.treble, "e4 g4 b4 a4"));

        let isParallelOctaves = false;

        for (let measureNumber = 0; measureNumber < exercise.cantusFirmus.notes.length - 1; measureNumber++) {
            if (measureNumber < exercise.cantusFirmus.notes.length - 1) {
                const cantusFirmusNote = exercise.cantusFirmus.notes[measureNumber];
                const counterpointNote = exercise.counterpoint.notes[measureNumber];
                const firstInterval = new Interval(cantusFirmusNote, counterpointNote);

                const nextCantusFirmusNote = exercise.cantusFirmus.notes[measureNumber + 1];
                const nextCounterpointNote = exercise.counterpoint.notes[measureNumber + 1];
                const secondInterval = new Interval(nextCantusFirmusNote, nextCounterpointNote);

                console.log(`(${cantusFirmusNote}, ${counterpointNote}) | (${nextCantusFirmusNote}, ${nextCounterpointNote})`);

                isParallelOctaves = firstInterval.isOctave() && secondInterval.isOctave();
                console.log(`first: ${firstInterval.toString()} | second: ${secondInterval.toString()}`);
                if (isParallelOctaves) {
                    break;
                }
            }
        };

        expect(isParallelOctaves).toBe(true);
    });
});
