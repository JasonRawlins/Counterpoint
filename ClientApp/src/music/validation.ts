import { Exercise } from "./counterpoint";

export function getParallelFifths(exercise: Exercise) {
    const measures: number[] = [];

    for (let measureNumber = 0; measureNumber < exercise.cantusFirmus.notes.length - 1; measureNumber++) {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            if (firstInterval.isFifth() && secondInterval.isFifth()) {
                measures.push(measureNumber);
            }
        }
    };

    return measures;
}

export function getParallelOctaves(exercise: Exercise) {
    const measures: number[] = [];

    for (let measureNumber = 0; measureNumber < exercise.cantusFirmus.notes.length - 1; measureNumber++) {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            if (firstInterval.isOctave() && secondInterval.isOctave()) {
                measures.push(measureNumber);
            }
        }
    };

    return measures;
}