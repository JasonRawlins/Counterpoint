export enum IntervalConstant {
    fifthInIntervals = 5,
    octaveInIntervals = 8,
    octaveInSemitones = 12,
    octaveInSteps = 7 // Steps to get to the next octave (e.g. C4 + 7 steps == C5)
}

export enum ScaleDegree {
    tonic = 1,
    supertonic = 2,
    mediant = 3,
    subdominant = 4,
    dominant = 5,
    submediant = 6,
    leadingTone = 7
}

export enum ClefType {
    bass = 0,
    alto = 1,
    treble = 2
}

export class Clef {
    static bass = new Clef(ClefType.bass);
    static alto = new Clef(ClefType.alto);
    static treble = new Clef(ClefType.treble);

    constructor(public type: ClefType) { }

    equals(other: Clef) {
        return this.type === other.type;
    }

    static next(current: ClefType, limit: ClefType, isLowerLimit: boolean) {
        let nextPosition = current + 1;
        if (isLowerLimit && nextPosition > ClefType.treble) {
            nextPosition = limit;
        } else if (!isLowerLimit && nextPosition > limit) {
            nextPosition = ClefType.bass;
        }

        return nextPosition;
    }

    toString(): string {
        return ClefType[this.type];
    }
}

const intervalQualities: { diminished: string, minor: string, major: string, augmented: string, perfect: string } = {
    diminished: "d",
    minor: "m",
    major: "M",
    augmented: "A",
    perfect: "P"
};

export class Interval {
    quality: string;
    simpleComparisonNote: Note;
    simpleValue: number;
    value: number;

    constructor(public referenceNote: Note, public comparisonNote: Note) {
        if (comparisonNote.midiNumber < referenceNote.midiNumber) {
            const temp = comparisonNote;
            this.comparisonNote = referenceNote;
            this.referenceNote = temp;
        }

        const referenceNoteScaleDegree = Key.c.indexOf(referenceNote.letter);
        const comparisonNoteScaleDegree = Key.c.indexOf(comparisonNote.letter);
        const octaveDifference = comparisonNote.octave - referenceNote.octave;
        this.value = comparisonNoteScaleDegree - referenceNoteScaleDegree + 1 + (IntervalConstant.octaveInSteps * octaveDifference);
        const simpleIntervalInfo: { value: number, comparisonNote: Note } = Interval.getSimpleIntervalInfo(referenceNote, comparisonNote, this.value);
        this.simpleValue = simpleIntervalInfo.value;
        this.simpleComparisonNote = simpleIntervalInfo.comparisonNote;
        this.quality = Interval.getQuality(referenceNote, this.simpleComparisonNote, this.simpleValue);
    }

    equals(otherInterval: Interval | string, simplified: boolean): boolean {
        if (otherInterval instanceof Interval) {
            if (simplified) {
                return this.simpleValue === otherInterval.simpleValue && this.quality === otherInterval.quality;
            } else {
                return this.value === otherInterval.value && this.quality === otherInterval.quality;
            }
        } else {
            // A string in the form of m2, M3, P5, etc.
            const intervalParts = otherInterval.split("");
            const quality = intervalParts[0];
            const value = parseInt(intervalParts[1], 10);

            if (simplified) {
                return this.simpleValue === value && this.quality === quality;
            } else {
                return this.value === value && this.quality === quality;
            }
        }
    }

    isFifth(simplified?: boolean) {
        return Interval.isInterval(this.value, [5, 12, 19, 26, 33, 40, 47, 54], simplified);
    }

    isFourth(simplified?: boolean) {
        return Interval.isInterval(this.value, [4, 11, 18, 25, 32, 39, 46, 53], simplified);
    }

    isOctave(simplified?: boolean) {
        return Interval.isInterval(this.value, [8, 15, 22, 29, 36, 43, 50, 57], simplified);
    }

    isPerfectConsonance() {
        return this.quality === intervalQualities.perfect && !this.isFourth();
    }

    isSecond(simplified?: boolean) {
        return Interval.isInterval(this.value, [2, 9, 16, 23, 30, 37, 44, 51], simplified);
    }

    isSeventh(simplified?: boolean) {
        return Interval.isInterval(this.value, [7, 14, 21, 28, 35, 42, 49, 56], simplified);
    }

    isUnison() {
        return this.value === 1;
    }

    toString(simplified: boolean) {
        return this.quality + (simplified ? this.simpleValue : this.value);
    }

    private static getQuality(referenceNote: Note, simpleComparisonNote: Note, simpleValue: number): any {
        const semitoneDifference: number = simpleComparisonNote.midiNumber - referenceNote.midiNumber;

        return (<any>{
            "1,0": intervalQualities.perfect,
            "1,1": intervalQualities.augmented,
            "2,1": intervalQualities.minor,
            "2,2": intervalQualities.major,
            "2,3": intervalQualities.augmented,
            "3,3": intervalQualities.minor,
            "3,4": intervalQualities.major,
            "3,5": intervalQualities.augmented,
            "4,4": intervalQualities.diminished,
            "4,5": intervalQualities.perfect,
            "4:6": intervalQualities.augmented,
            "5,6": intervalQualities.diminished,
            "5,7": intervalQualities.perfect,
            "5,8": intervalQualities.augmented,
            "6,7": intervalQualities.diminished,
            "6,8": intervalQualities.minor,
            "6,9": intervalQualities.major,
            "7,9": intervalQualities.diminished,
            "7,10": intervalQualities.minor,
            "7,11": intervalQualities.major,
            "8,12": intervalQualities.perfect
        })[simpleValue + "," + semitoneDifference];
    }

    private static getSimpleIntervalInfo(referenceNote: Note, comparisonNote: Note, value: number) {
        let simpleComparisonNote = comparisonNote;
        let simpleValue = value;

        while (simpleComparisonNote.midiNumber - referenceNote.midiNumber > IntervalConstant.octaveInSemitones) {
            simpleValue -= IntervalConstant.octaveInSteps;

            simpleComparisonNote = new Note(
                simpleComparisonNote.letter +
                simpleComparisonNote.accidental +
                (simpleComparisonNote.octave - 1).toString());
        }

        return {
            value: simpleValue,
            comparisonNote: simpleComparisonNote
        };
    }

    private static isInterval(value: number, intervalList: number[], simplified?: boolean) {
        simplified = simplified !== false;

        if (value > 8 && !simplified) {
            return false;
        }

        return intervalList.indexOf(value) !== -1;
    }
}

export class Key {
    static bf = ["bf", "c", "d", "ef", "f", "g", "a"];
    static f = ["f", "g", "a", "bf", "c", "d", "e"];
    static c = ["c", "d", "e", "f", "g", "a", "b"];
    static g = ["g", "a", "b", "c", "d", "e", "fs"];
    static d = ["d", "e", "fs", "g", "a", "b", "cs"];
    static a = ["a", "b", "cs", "d", "e", "fs", "gs"];
}

export enum MidiNumber {
    c2 = 36, cs2 = 37, df2 = 37, d2 = 38, ds2 = 39, ef2 = 39, e2 = 40, es2 = 41, f2 = 41, fs2 = 42, gf2 = 42, g2 = 43, gs2 = 44, af2 = 44, a2 = 45, as2 = 46, bf2 = 46, b2 = 47, bs2 = 88,
    c3 = 48, cs3 = 49, df3 = 49, d3 = 50, ds3 = 51, ef3 = 51, e3 = 52, es3 = 53, f3 = 53, fs3 = 54, gf3 = 54, g3 = 55, gs3 = 56, af3 = 56, a3 = 57, as3 = 58, bf3 = 58, b3 = 59, bs3 = 60,
    c4 = 60, cs4 = 61, df4 = 61, d4 = 62, ds4 = 63, ef4 = 63, e4 = 64, es4 = 65, f4 = 65, fs4 = 66, gf4 = 66, g4 = 67, gs4 = 68, af4 = 68, a4 = 69, as4 = 70, bf4 = 70, b4 = 71, bs4 = 72,
    c5 = 72, cs5 = 73, df5 = 73, d5 = 74, ds5 = 75, ef5 = 75, e5 = 76, es5 = 77, f5 = 77, fs5 = 78, gf5 = 78, g5 = 79, gs5 = 80, af5 = 80, a5 = 81, as5 = 82, bf5 = 82, b5 = 83, bs5 = 84,
    c6 = 84, cs6 = 85, df6 = 85, d6 = 86, ds6 = 87, ef6 = 87, e6 = 88, es6 = 89, f6 = 89, fs6 = 90, gf6 = 90, g6 = 91, gs6 = 92, af6 = 92, a6 = 93, as6 = 94, bf6 = 94, b6 = 95, bs6 = 96,
}

interface Duration {
    length: number
}

export class Note implements Duration {
    accidental = "";
    letter: string;
    midiNumber: MidiNumber;
    octave: number;
    scaleIndex: number;
    length: number = 1; // For now, assume it's first species and a whole note. 

    constructor(note: string) {
        const noteParts = note.split("");
        this.letter = noteParts[0].toLowerCase();

        if (noteParts.length === 2) {
            this.octave = parseInt(noteParts[1], 10);
        } else {
            this.accidental = noteParts[1].toLowerCase();
            this.octave = parseInt(noteParts[2], 10);
        }

        this.midiNumber = (MidiNumber as any)[this.letter + this.accidental + this.octave];
        this.scaleIndex = Key.c.indexOf(this.letter);
    }

    equals(otherNote: Note | string, ignoreOctave?: boolean) {
        if (!otherNote) {
            return false;
        }

        let internalOtherNote: Note;

        if (typeof otherNote === "string") {
            internalOtherNote = new Note(otherNote);
        } else {
            internalOtherNote = otherNote;
        }

        const notesEqual = this.letter === internalOtherNote.letter && this.accidental === internalOtherNote.accidental;

        if (ignoreOctave) {
            return notesEqual;
        } else {
            return notesEqual && this.octave === internalOtherNote.octave;
        }
    }

    subtract(intervalValue: number) {
        let scaleIndex = this.scaleIndex - intervalValue;
        let octaveReduction = 0;
        while (scaleIndex < 0) {
            octaveReduction++;
            scaleIndex = IntervalConstant.octaveInSteps - Math.abs(scaleIndex);
        }

        return new Note(Key.c[scaleIndex] + (this.octave - octaveReduction).toString(10));
    }

    toString(friendlyDisplay = false) {
        let letter = this.letter;
        let accidental = this.accidental;

        if (friendlyDisplay) {
            if (accidental === "s") {
                accidental = "♯";
            } else if (accidental === "f") {
                accidental = "♭";
            }

            letter = letter.toUpperCase();
        }

        return letter + accidental + this.octave;
    }
}

export class Rest implements Duration {
    length = 1;  // For now, assume it's first species and a whole note. 

    constructor(length: number) {
        this.length = length;
    }
}