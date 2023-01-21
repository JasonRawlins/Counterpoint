import { firstSpeciesValidation } from "rxjs/operators";
import { Interval, Note } from "./core";
import { Exercise } from "./counterpoint";

export function getDissonantIntervals(exercise: Exercise) {
  const measures: number[] = [];

  return measures;
}

export function getParallelOctaves(exercise: Exercise) {

}

export function getParallelFifths(exercise: Exercise) {
}

function getParallelPerfects(exercise: Exercise, intervalValue: number): number[] {
  const measures: number[] = [];

  return measures;
}

export function getHiddenFifths(exercise: Exercise) {
}

export function getHiddenOctaves(exercise: Exercise) {
}

function getHiddenPerfects(exercise: Exercise, intervalValue: number) {
  const measures: number[] = [];

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

  return measures;
}

export function getHighpoints(exercise: Exercise) {
  let highpoints: number[] = [];

  return highpoints;
}

export function getCrossedVoices(exercise: Exercise) {
  let crossedVoices: number[] = [];

  return crossedVoices;
}

export function firstMeasureIntervalIsValid(exercise: Exercise) {
}

export function lastMeasureIntervalIsValid(exercise: Exercise) {
}

export function numberOf3rds6ths10thsIsValid(exercise: Exercise) {
  let isValid = true;
  
  return isValid;
}

export function leadingToneIsApproachedByStep(exercise: Exercise) {
}

export function numberOfTiedNotesIsValid(exercise: Exercise) {
  let measures: number[] = [];

  return measures.length <= 2;
}

