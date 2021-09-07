import { Clef, Interval, Key } from "./core";
import { Exercise, Voice, VoicePosition } from "./counterpoint";
import * as validation from "./validation";

describe("Parallel fifths and octaves", () => {
    it("should detect parallel octaves", () => {
        const exercise = createExercise("e3 g3", "e4 g4");
        const hasParallelOctaves = validation.getParallelOctaves(exercise);
        expect(hasParallelOctaves).toBe(true);
    });

    it("should detect parallel fifths", () => {
        const exercise = createExercise("a4 g4", "e5 d5");
        const hasParallelFifths = validation.getParallelFifths(exercise);
        expect(hasParallelFifths).toBe(true);
    });
});


function createExercise(cantusFirmusNotes: string, counterpointNotes: string) {
    return new Exercise(
        Key.c,
        new Voice(VoicePosition.bottom, Clef.bass, cantusFirmusNotes, true),
        new Voice(VoicePosition.top, Clef.treble, counterpointNotes));
}