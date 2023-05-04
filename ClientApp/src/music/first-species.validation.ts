import { firstSpeciesValidation } from "rxjs/operators";
import { Interval, Note, ScaleDegree } from "./core";
import { Exercise } from "./counterpoint";

export function getDissonantIntervals(exercise: Exercise) {
  const measures: number[] = [];

  exercise.cantusFirmus.notes.forEach((note, measureNumber) => {
    var interval = exercise.intervalAt(measureNumber);
    if (interval && interval.isDissonant()) {
      measures.push(measureNumber);
    }
  });

  return measures;
}

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

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    if (measureNumber + 1 < exercise.cantusFirmus.notes.length) {
      const firstInterval = exercise.intervalAt(measureNumber);
      const secondInterval = exercise.intervalAt(measureNumber + 1);

      if (firstInterval !== null && secondInterval !== null) {
        const isSimilarMotion =
          (firstInterval.bottomNote.isLowerThan(secondInterval.bottomNote) && firstInterval.topNote.isLowerThan(secondInterval.topNote))
          ||
          (firstInterval.bottomNote.isHigherThan(secondInterval.bottomNote) && firstInterval.topNote.isHigherThan(secondInterval.topNote));

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

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
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
  let highpoints: number[] = [];

  let highNote = new Note("a0");

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    const counterpointNote = exercise.counterpoint.notes[measureNumber];
    if (counterpointNote?.isHigherThan(highNote)) {
      highNote = counterpointNote;
    }
  });

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    const counterpointNote = exercise.counterpoint.notes[measureNumber];
    const possibleTiedCounterpointNote = exercise.counterpoint.notes[measureNumber - 1];
    if (counterpointNote?.equals(highNote) && !counterpointNote?.equals(possibleTiedCounterpointNote)) {
      highpoints.push(measureNumber);
    }
  });

  return highpoints;
}

export function getCrossedVoices(exercise: Exercise) {
  let crossedVoices: number[] = [];

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    const counterpointNote = exercise.counterpoint.notes[measureNumber];
    if (counterpointNote?.isLowerThan(cantusFirmusNote)) {
      crossedVoices.push(measureNumber);
    }
  });

  return crossedVoices;
}

export function firstMeasureIntervalIsValid(exercise: Exercise) {
  if (exercise.intervalAt(0) === null) {
    return true;
  }

  return (exercise.intervalAt(0)?.isFifth() || exercise.intervalAt(0)?.isOctave()) || false;
}

export function lastMeasureIntervalIsValid(exercise: Exercise) {
  const lastMeasureInterval = exercise.intervalAt(exercise.length - 1);
  if (lastMeasureInterval === null) {
    return true;
  }

  return (lastMeasureInterval?.isUnison() || lastMeasureInterval?.isOctave()) || false;
}

export function numberOf3rds6ths10thsIsValid(exercise: Exercise) {
  let isValid = true;
  
  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    if (measureNumber + 3 < exercise.length) {
      const firstInterval = exercise.intervalAt(measureNumber);
      const secondInterval = exercise.intervalAt(measureNumber + 1);
      const thirdInterval = exercise.intervalAt(measureNumber + 2);
      const fourthInterval = exercise.intervalAt(measureNumber + 3)

      if (firstInterval?.isThird() && secondInterval?.isThird() && thirdInterval?.isThird() && fourthInterval?.isThird())
        isValid = false;

      if (firstInterval?.isSixth() && secondInterval?.isSixth() && thirdInterval?.isSixth() && fourthInterval?.isSixth())
        isValid = false;
    }
  });

  return isValid;
}

export function leadingToneIsApproachedByStep(exercise: Exercise) {
  const thirdToLastMeasureInterval = exercise.intervalAt(exercise.length - 3);
  const secondToLastMeasureInterval = exercise.intervalAt(exercise.length - 2);

  if (!thirdToLastMeasureInterval || !secondToLastMeasureInterval) {
    return true;
  }

  if (secondToLastMeasureInterval.topNote.scaleIndex !== ScaleDegree.leadingTone) {
    return false;
  }

  const counterpointNoteIsTonic = thirdToLastMeasureInterval.topNote.scaleIndex === ScaleDegree.tonic;
  const counterpointNoteIsSubmediant = thirdToLastMeasureInterval.topNote.scaleIndex === ScaleDegree.submediant;
  const counterpointNoteIsLeadingTone = thirdToLastMeasureInterval.topNote.scaleIndex === ScaleDegree.leadingTone;

  if (counterpointNoteIsTonic || counterpointNoteIsSubmediant || counterpointNoteIsLeadingTone) {
      return true;
  }

  return false;
}

export function numberOfTiedNotesIsValid(exercise: Exercise) {
  let measures: number[] = [];

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    const thisNote = exercise.counterpoint.note(measureNumber);
    const nextNote = exercise.counterpoint.note(measureNumber + 1);

    if (thisNote && nextNote && thisNote.equals(nextNote)) {
      measures.push(measureNumber);
    }
  });

  return measures.length <= 2;
}

export function lengthOfTiedNotesIsValid(exercise: Exercise) {
  let measures: number[] = [];

  exercise.cantusFirmus.notes.forEach((cantusFirmusNote, measureNumber) => {
    const thisNote = exercise.counterpoint.note(measureNumber);
    const nextNote = exercise.counterpoint.note(measureNumber + 1);
    const nextNextNote = exercise.counterpoint.note(measureNumber + 2);

    if (thisNote && nextNote && nextNextNote && thisNote.equals(nextNote) && thisNote.equals(nextNextNote)) {
      measures.push(measureNumber);
    }
  });

  return measures.length === 0;
}

const validMark = "<span class='rule-valid' _ngcontent-ng-cli-universal-c51>✓ </span>";
const invalidMark = "<span class='rule-invalid' _ngcontent-ng-cli-universal-c51>X </span>";

export function displayMultiMeasureValidation(preamble: string, selector: string, noErrorsMessage: string, validatedMeasures: number[]) {
  const displayElement = document.getElementById(selector);
  let validationMessage = preamble + " in measures ";
  validatedMeasures.forEach(measureNumber => {
    validationMessage += `(${measureNumber + 1} and ${measureNumber + 2}), `;
  });

  if (validatedMeasures.length > 0) {
    displayElement!.innerHTML = invalidMark + validationMessage.substring(0, validationMessage.length - 2);
  } else {
    displayElement!.innerHTML = validMark + noErrorsMessage;
  }
}

export function displaySingleMeasureValidation(preamble: string, selector: string, noErrorsMessage: string, validatedMeasures: number[], measureCountThreshold: number = 0) {
  const displayElement = document.getElementById(selector);
  let validationMessage = preamble + " in measure(s) ";
  validatedMeasures.forEach(measureNumber => {
    validationMessage += `${measureNumber + 1}, `;
  });

  if (validatedMeasures.length > measureCountThreshold) {
    displayElement!.innerHTML = invalidMark + validationMessage.substring(0, validationMessage.length - 2);
  } else {
    displayElement!.innerHTML = validMark + noErrorsMessage;
  }
}

export function displayMessageValidation(selector: string, validMessage: string, invalidMessage: string, isValid: boolean) {
  const displayElement = document.getElementById(selector);
  if (isValid) {
    displayElement!.innerHTML = validMark + validMessage;
  }
  else {
    displayElement!.innerHTML = invalidMark + invalidMessage;
  }
}

