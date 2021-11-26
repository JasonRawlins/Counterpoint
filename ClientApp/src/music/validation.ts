import { Interval, Note } from "./core";
import { Exercise } from "./counterpoint";

export interface MeasureInterval {
    number: number,
    rule: Rule
}

export function getParallelPerfects(exercise: Exercise, interval: number) {
    const measures: MeasureInterval[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            var isParallelPerfect = 
                (interval === 5 && firstInterval.isFifth() && secondInterval.isFifth()) ||
                (interval === 8 && firstInterval.isOctave() && secondInterval.isOctave());

            if (isParallelPerfect) {
                measures.push({ number: measureNumber, interval });
            }
        }
    });

    return measures;
}

export function getHiddenPerfects(exercise: Exercise, interval: number) {
    const measures: number[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            const isSimilarMotion = 
                (firstInterval.topNote.isLowerThan(secondInterval.topNote)
                &&
                firstInterval.bottomNote.isLowerThan(secondInterval.bottomNote))
                ||
                (firstInterval.topNote.isHigherThan(secondInterval.topNote)
                &&
                firstInterval.bottomNote.isHigherThan(secondInterval.bottomNote));

            if (interval === 5 && isSimilarMotion && !firstInterval.isFifth() && secondInterval.isFifth()) {
                measures.push(measureNumber);
            }

            if (interval === 8 && isSimilarMotion && !firstInterval.isOctave() && secondInterval.isOctave()) {
                measures.push(measureNumber);
            }
        }
    });

    return measures;
}

export function getDissonantIntervals(exercise: Exercise) {
    const measures: MeasureInterval[] = [];

    exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
        const interval = exercise.intervalAt(measureNumber);

        if (interval.isDissonant()) {
            measures.push({ number: measureNumber, interval });
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