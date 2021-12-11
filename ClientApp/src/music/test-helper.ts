import { Clef, Key } from "./core";
import { Exercise, Voice, VoicePosition } from "./counterpoint";

export function createExercise(cantusFirmusNotes: string, counterpointNotes: string) {
    return new Exercise(
        Key.c,
        new Voice(VoicePosition.bottom, Clef.bass, cantusFirmusNotes, true),
        new Voice(VoicePosition.top, Clef.treble, counterpointNotes));
}