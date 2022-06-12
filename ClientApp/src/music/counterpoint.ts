import { Clef, Interval, Note, Rest } from "./core";

export class Voice {
    notes: Note[];

    constructor(public voicePosition: VoicePosition, public clef: Clef, notes: Note[] | string, public readonly isCounterpoint = false) {
        if (typeof notes === "string") {
            this.notes = this.stringToNoteArray(notes);
        } else {
            this.notes = notes;
        }
    }

    addNote(index: number, newNote: Note) {
        this.notes[index] = newNote;
    }

    note(index: number): Note {
        return this.notes[index];
    }

    removeNote(index: number) {
        this.notes[index] = new Note("r1"); // assume whole note for now
    }

    serialize(): string {
        return JSON.stringify({
            clef: this.clef,
            isCounterpoint: this.isCounterpoint,
            notes: this.notes.map(note => note.toString()).join(" "),
            voicePosition: this.voicePosition
        });
    }

    private stringToNoteArray(notes: string): Note[] {
        if (notes) {
            return notes.split(" ").map(n => new Note(n));
        }

        return [];
    }

    toString() {
        return this.notes.map((note: Note) => note.toString(true)).join(" ");
    }
}

export enum VoicePosition {
    bottom,
    top
}

export class Exercise {
    bottom!: Voice;
    counterpoint: Voice;
    length: number;
    top!: Voice;

    constructor(public key: string[], public cantusFirmus: Voice, counterpoint: Voice) {
        this.length = cantusFirmus.notes.length;
        this.counterpoint = new Voice(
            this.cantusFirmus.voicePosition === VoicePosition.bottom ? VoicePosition.top : VoicePosition.bottom,
            counterpoint.clef,
            this.normalizeCounterpointNotes(counterpoint.notes, cantusFirmus.notes.length),
            true
        );

        if (cantusFirmus.voicePosition === VoicePosition.bottom) {
            this.top = this.counterpoint;
            this.bottom = cantusFirmus;
        } else if (cantusFirmus.voicePosition === VoicePosition.top) {
            this.top = cantusFirmus;
            this.bottom = this.counterpoint;
        }
    }

    intervalAt(measureNumber: number): Interval | null {
        const cantusFirmusNote = this.cantusFirmus.notes[measureNumber];
        const counterpointNote = this.counterpoint.notes[measureNumber];

        if (!cantusFirmusNote || !counterpointNote)
            return null;

        return new Interval(cantusFirmusNote, counterpointNote);
    }

    reset() {
        for (let i = 0; i < this.counterpoint.notes.length; i++) {
            this.counterpoint.notes[i] = new Note("r1"); // Assume a whole note for now.
        }
    }

    serialize() {
        return {
            cantusFirmus: this.cantusFirmus.serialize(),
            counterpoint: this.counterpoint.serialize(),
            key: this.key
        };
    }

    toString() {
        return ["Cantus firmus:", this.cantusFirmus.notes, "Counterpoint:", this.counterpoint.notes].join(" ");
    }

    voice(voicePosition: VoicePosition): Voice {
        return voicePosition === VoicePosition.top ? this.top : this.bottom;
    }

    private normalizeCounterpointNotes(notes: Note[], cantusFirmusLength: number): Note[] {
        // If the counterpoint has more notes than the cantus firmus, truncate the extra notes.
        if (notes.length > cantusFirmusLength) {
            return notes.slice(0, cantusFirmusLength);
        }

        // Padd any missing notes in the counterpoint.
        if (notes.length < cantusFirmusLength) {
            let paddedNotes: Note[] = [];
            for (let i = 0; i < cantusFirmusLength; i++) {
                paddedNotes[i] = notes[i] || null;
            }
            return paddedNotes;
        }

        return notes;
    }
}