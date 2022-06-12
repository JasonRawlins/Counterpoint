import { first } from "rxjs/operators";
import { Interval, Note } from "./core";
import { Exercise } from "./counterpoint";

export function getParallelOctaves(exercise: Exercise) {
    return getParallelPerfects(exercise, 8);
}

export function getParallelFifths(exercise: Exercise) {
    return getParallelPerfects(exercise, 5);
}

function getParallelPerfects(exercise: Exercise, intervalValue: number): number[] {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            if (firstInterval !== null && secondInterval !== null) {
                var isParallelPerfect =
                    (intervalValue === 5 && firstInterval.isFifth() && secondInterval.isFifth()) ||
                    (intervalValue === 8 && firstInterval.isOctave() && secondInterval.isOctave());

                if (isParallelPerfect) {
                    measures.push(measureNumber);
                }
            }
        }
    });

    return measures;
}

export function getHiddenFifths(exercise: Exercise) {
    return getHiddenPerfects(exercise, 5);
}

export function getHiddenOctaves(exercise: Exercise) {
    return getHiddenPerfects(exercise, 8);
}

function getHiddenPerfects(exercise: Exercise, intervalValue: number) {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            if (firstInterval !== null && secondInterval !== null) {
                const isSimilarMotion =
                    (firstInterval.topNote.isLowerThan(secondInterval.topNote) && firstInterval.bottomNote.isLowerThan(secondInterval.bottomNote))
                    ||
                    (firstInterval.topNote.isHigherThan(secondInterval.topNote) && firstInterval.bottomNote.isHigherThan(secondInterval.bottomNote));

                if (intervalValue === 5 && isSimilarMotion && !firstInterval.isFifth() && secondInterval.isFifth()) {
                    measures.push(measureNumber);
                }

                if (intervalValue === 8 && isSimilarMotion && !firstInterval.isOctave() && secondInterval.isOctave()) {
                    measures.push(measureNumber);
                }
            }
        }
    });

    return measures;
}

export function getUnisons(exercise: Exercise) {
    return getIntervals(exercise, 1);
}

export function getSeconds(exercise: Exercise) {
    return getIntervals(exercise, 2);
}

export function getThirds(exercise: Exercise) {
    return getIntervals(exercise, 3);
}

export function getFourths(exercise: Exercise) {
    return getIntervals(exercise, 4);
}

export function getFifths(exercise: Exercise) {
    return getIntervals(exercise, 5);
}

export function getSixths(exercise: Exercise) {
    return getIntervals(exercise, 6);
}

export function getSevenths(exercise: Exercise) {
    return getIntervals(exercise, 7);
}

export function getOctaves(exercise: Exercise) {
    return getIntervals(exercise, 8);
}

function getIntervals(exercise: Exercise, intervalValue: number) {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        const interval = exercise.intervalAt(measureNumber);

        if (interval !== null) {
            if (intervalValue === 1 && interval.isUnison() ||
                intervalValue === 2 && interval.isSecond() ||
                intervalValue === 3 && interval.isThird() ||
                intervalValue === 4 && interval.isFourth() ||
                intervalValue === 5 && interval.isFifth() ||
                intervalValue === 6 && interval.isSixth() ||
                intervalValue === 7 && interval.isSeventh() ||
                intervalValue === 8 && interval.isOctave()
            ) {
                measures.push(measureNumber);
            }
        }
    });

    return measures;
}

export function getHighpoints(exercise: Exercise) {
    let highpoints: Note[] = [];

    let highNote = new Note("a0");
    // Octave and letter and accidental
    exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
        const counterpointNote = exercise.counterpoint.notes[measureNumber];
        if (counterpointNote.compareTo(highNote) === 1) {
            highNote = counterpointNote;
        }
    });

    exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
        const counterpointNote = exercise.counterpoint.notes[measureNumber];
        if (counterpointNote.equals(highNote)) {
            highpoints.push(counterpointNote);
        }
    });

    return highpoints;
}

enum Rule {
    prohibitParallelFifths,
    prohibitParallelOctaves
}
