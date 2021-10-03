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
        const exercise = createExercise("f4 f4 f4 f4", "g4 b4 e5 a4");
        const dissonantMeasures = validation.getDissonantIntervals(exercise);
        expect(dissonantMeasures.length).toBe(3);
    });
});

describe("Melodic line", () => {
    it("should have a single high point", () => {
        const exercise = createExercise("b3 b3 b3", "d4 f4 c4");
        const highPointMeasures = validation.getHighpoints(exercise);
        expect(highPointMeasures.length).toBe(1);
    });

    it("should detect multiple high points", () => {
        const exercise = createExercise("a3 f3 b3", "e4, d4, e4");
        const highpoints = validation.getHighpoints(exercise);
        expect(highpoints.length).toBe(2);
    });
});

function createExercise(cantusFirmusNotes: string, counterpointNotes: string) {
    return new Exercise(
        Key.c,
        new Voice(VoicePosition.bottom, Clef.bass, cantusFirmusNotes, true),
        new Voice(VoicePosition.top, Clef.treble, counterpointNotes));
}