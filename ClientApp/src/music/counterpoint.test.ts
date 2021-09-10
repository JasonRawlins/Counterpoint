import { Clef, Interval, Key } from "./core";
import { Exercise, Voice, VoicePosition } from "./counterpoint";
import * as validation from "./validation";

describe("Parallel fifths and octaves", () => {
    it("should detect parallel octaves", () => {
        const exercise = createExercise("e3 g3", "e4 g4");
        const parallelOctaveMeasures = validation.getParallelPerfects(exercise, 8);
        expect(parallelOctaveMeasures.length).toBe(1);
    });

    it("should detect parallel fifths", () => {
        const exercise = createExercise("a4 g4", "e5 d5");
        const parallelFifthsMeasuers = validation.getParallelPerfects(exercise, 5);
        expect(parallelFifthsMeasuers.length).toBe(1);
    });
});

describe("Intervals", () => {
    it("should detect dissonant intervals", () => {
        const exercise = createExercise("d4 fs4 e4", "g4 e5 fs4");
        const dissonantMeasures = validation.getDissonantIntervals(exercise);
        expect(dissonantMeasures.length).toBe(3);
    });
});

function createExercise(cantusFirmusNotes: string, counterpointNotes: string) {
    return new Exercise(
        Key.c,
        new Voice(VoicePosition.bottom, Clef.bass, cantusFirmusNotes, true),
        new Voice(VoicePosition.top, Clef.treble, counterpointNotes));
}