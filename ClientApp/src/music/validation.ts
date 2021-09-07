import { Exercise } from "./counterpoint";

export function getParallelFifths(exercise: Exercise) {
    for (let measureNumber = 0; measureNumber < exercise.cantusFirmus.notes.length - 1; measureNumber++) {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            //console.log(`(${cantusFirmusNote}, ${counterpointNote}) | (${nextCantusFirmusNote}, ${nextCounterpointNote})`);
            //console.log(`first: ${firstInterval.toString()} | second: ${secondInterval.toString()}`);
            if (firstInterval.isFifth() && secondInterval.isFifth()) {
                return true;
            }
        }
    };

    return false;
}

export function getParallelOctaves(exercise: Exercise) {
    for (let measureNumber = 0; measureNumber < exercise.cantusFirmus.notes.length - 1; measureNumber++) {
        if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
            const firstInterval = exercise.intervalAt(measureNumber);
            const secondInterval = exercise.intervalAt(measureNumber + 1);

            //console.log(`(${cantusFirmusNote}, ${counterpointNote}) | (${nextCantusFirmusNote}, ${nextCounterpointNote})`);
            //console.log(`first: ${firstInterval.toString()} | second: ${secondInterval.toString()}`);
            if (firstInterval.isOctave() && secondInterval.isOctave()) {
                return true;
            }
        }
    };

    return false;
}