import { Exercise } from "./counterpoint";

export function getParallelPerfects(exercise: Exercise, interval: number) {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            if (interval === 5 && firstInterval.isFifth() && secondInterval.isFifth()) {
                measures.push(measureNumber);
            }

            if (interval === 8 && firstInterval.isOctave() && secondInterval.isOctave()) {
                measures.push(measureNumber);
            }
        }
    });

    return measures;
}

export function getDissonantIntervals(exercise: Exercise) {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        const interval = exercise.intervalAt(measureNumber);

        if (interval.isDissonant()) {
            measures.push(measureNumber);
        }
    });

    return measures;
}