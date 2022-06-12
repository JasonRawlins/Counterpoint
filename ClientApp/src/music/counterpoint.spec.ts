
import * as validation from "./validation";
import { createExercise } from "./test-helper";

describe("Fifths and octaves", () => {
    it("should detect parallel octaves", () => {
        const exercise = createExercise("e3 g3", "e4 g4");
        const parallelOctaveMeasures = validation.getParallelOctaves(exercise);
        expect(parallelOctaveMeasures.length).toBe(1);
    });

    it("should detect parallel fifths", () => {
        const exercise = createExercise("a4 g4", "e5 d5");
        const parallelFifthsMeasures = validation.getParallelFifths(exercise);
        expect(parallelFifthsMeasures.length).toBe(1);
    });

    it("should detect hidden fifths in ascending motion", () => {
        const exercise = createExercise("e4 g4", "c5 d5");
        const hiddenFifthsMeasures = validation.getHiddenFifths(exercise);
        expect(hiddenFifthsMeasures.length).toBe(1);
    });

    it("should detect hidden fifths in descending motion", () => {
        const exercise = createExercise("f4 e4", "d5 b4");
        const hiddenFifthsMeasures = validation.getHiddenFifths(exercise);
        expect(hiddenFifthsMeasures.length).toBe(1);
    });

    it("should detect hidden octaves in ascending motion", () => {
        const exercise = createExercise("d4 e4", "b4 e5");
        const hiddenFifthsMeasures = validation.getHiddenOctaves(exercise);
        expect(hiddenFifthsMeasures.length).toBe(1);
    });

    it("should detect hidden octaves in descending motion", () => {
        const exercise = createExercise("f4 c4", "d5 c5");
        const hiddenFifthsMeasures = validation.getHiddenOctaves(exercise);
        expect(hiddenFifthsMeasures.length).toBe(1);
    });
});

describe("Melodic line", () => {
    it("should have a single high point", () => {
        const exercise = createExercise("b3 b3 b3", "d4 f4 c4");
        const highPointMeasures = validation.getHighpoints(exercise);
        expect(highPointMeasures.length).toBe(1);
    });

    it("should detect multiple high points", () => {
        const exercise = createExercise("a3 f3 b3", "e4 d4 e4");
        const highpoints = validation.getHighpoints(exercise);
        expect(highpoints.length).toBe(2);
    });
});