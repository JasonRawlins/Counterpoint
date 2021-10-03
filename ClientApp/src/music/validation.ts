import { Note } from "./core";
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

export function getHighpoints(exercise: Exercise) {
    let highpoints: Note[] = [];

    console.log("getHighpoints");

    let highNote = new Note("a0");
    // Octave and letter and accidental
    exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
        const counterpointNote = exercise.counterpoint.notes[measureNumber];
        if (counterpointNote.compareTo(highNote) === 1) {
            highNote = counterpointNote;
        }
    });

    console.log(`High point: ${highNote.toString(true)}`)

    exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
        const counterpointNote = exercise.counterpoint.notes[measureNumber];
        if (counterpointNote.equals(highNote)) {
            highpoints.push(counterpointNote);
        }
    });

    return highpoints;
}