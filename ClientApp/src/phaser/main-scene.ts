import * as Phaser from "phaser";
import * as dat from "dat.gui";
import { Exercise, Voice, VoicePosition } from "../music/counterpoint";
import { Clef, Key, Note } from "../music/core";

const screenSize = { width: 675, height: 200 };
const wholeNoteHeight = 12;
const unit = (wholeNoteHeight / screenSize.height) * 100;

const style = {
    padding: {
        left: 10
    }
};

enum PitchYInSemitones { 
    c6 = 0,
    b5 = 1,
    a5 = 2,
    g5 = 3,
    f5 = 4,
    e5 = 5,
    d5 = 6,
    c5 = 7,
    b4 = 8,
    a4 = 9,
    g4 = 10,
    f4 = 11,
    e4 = 12,
    d4 = 13,
    c4 = 14,
    b3 = 15,
    a3 = 16
};

const constants = {
    DATA: "DATA",
    pitch: {
        F5: "F5",
        E5: "E5",
        D5: "D5",
        C5: "C5",
        B4: "B4",
        A4: "A4",
        G4: "G4",
        F4: "F4",
        E4: "E4",
        D4: "F4"
    },
    terms: {
        GHOST_NOTE: "GHOST_NOTE",
        MEASURE: "MEASURE",
        NOTE: "NOTE",
        PITCH: "PITCH"
    }
};

interface Measure {
    note: Note,
    number: number
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game"
};

export default class MainScene extends Phaser.Scene {
    private controls!: Phaser.Cameras.Controls.SmoothedKeyControl;
    private mainContainer!: Phaser.GameObjects.Container;
    private gui: dat.GUI;
    private feedbackText!: Phaser.GameObjects.Text;

    private exercise = new Exercise(Key.c,
        new Voice(VoicePosition.bottom, Clef.bass, "e4 f4 g4 a4", true),
        new Voice(VoicePosition.top, Clef.treble, "g4 a4 b4 c5")
    );

    private measureLeftOffset = 100;
    private measureWidth = 100;
    //private measuresWidth = this.measureWidth * this.exercise.length;

    constructor() {
        super(sceneConfig);
        this.gui = new dat.GUI();
    }

    public preload() {
        this.load.multiatlas("musical-symbols", "assets/musical-symbols.json", "assets");
    }

    public create() {
        this.renderDiagnosticsScreen();

        const cursors = this.input.keyboard.createCursorKeys();
        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.mainContainer = this.add.container(0, 0);

        this.renderGrandStaff();
        this.renderMeasures();

        this.feedbackText = this.add.text(0, 250, "Feedback", { color: "#000000" });
        this.mainContainer.add(this.feedbackText);
    }

    public update(time: number, delta: number) {
        this.controls.update(delta);
    }

    renderGrandStaff() {
        const beginningBarLine = this.add.line(style.padding.left, PitchYInSemitones.f5 * unit, 0, 0, 0, (PitchYInSemitones.e4 - PitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);

        const trebleClef = this.add.image(unit * 3, unit * 1.3, "musical-symbols", "treble-clef.png").setOrigin(0);
        const trebleClefToWholeNoteRatio = 0.168;
        trebleClef.setScale(trebleClefToWholeNoteRatio * unit);

        // Treble staff
        const f5Line = this.createStaffLine("f5 line", PitchYInSemitones.f5);
        const d5Line = this.createStaffLine("d5 line", PitchYInSemitones.d5);
        const b4Line = this.createStaffLine("b4 line", PitchYInSemitones.b4);
        const g4Line = this.createStaffLine("g4 line", PitchYInSemitones.g4);
        const e4Line = this.createStaffLine("e4 line", PitchYInSemitones.e4);

        const doubleBarSpacing = 4;
        const endBarline1 = this.add.line(style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth, PitchYInSemitones.f5 * unit, 0, 0, 0, (PitchYInSemitones.e4 - PitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);
        const endBarline2 = this.add.line(style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth - doubleBarSpacing, PitchYInSemitones.f5 * unit, 0, 0, 0, (PitchYInSemitones.e4 - PitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);

        this.mainContainer.add([
            beginningBarLine,
            trebleClef,
            f5Line, d5Line, b4Line, g4Line, e4Line,
            endBarline1, endBarline2
        ]);
    }

    createStaffLine(name: string, pitchYInSemitones: number) {
        const line = this.add.line(style.padding.left, pitchYInSemitones * unit, 0, 0, this.measureLeftOffset + this.measureWidth * this.exercise.length, 0, 0x000000).setOrigin(0);
        line.name = name;

        return line;
    }

    renderMeasures() {
        this.exercise.counterpoint.notes.forEach((note: Note, measureNumber: number) => {
            const measureLeft = this.measureLeftOffset + (this.measureWidth * measureNumber);
            const measureDisplay = this.add.rectangle(measureLeft, 0, this.measureWidth, (PitchYInSemitones.a3 - PitchYInSemitones.c6) * unit, 0xffffff).setOrigin(0);
            const measureCenterX = (measureDisplay.x + this.measureWidth / 2) - wholeNoteHeight; // TODO: Why am I using wholeNoteHeight rather than unit
            console.log(note.toString());

            const noteY = PitchYInSemitones[note.toString() as keyof typeof PitchYInSemitones] * unit - (wholeNoteHeight / 2);

            measureDisplay.setInteractive();
            measureDisplay.setAlpha(0.5);
            measureDisplay.name = `measure ${measureNumber} | note ${note.toString()}`;
            //measureDisplay.setData(constants.terms.MEASURE, { number: measureNumber, note: note });

            this.mainContainer.add(measureDisplay);

            if (measureNumber > 0) {
                this.createMeasureLine("", measureLeft / 2);
            }

            let ghostNote: Phaser.GameObjects.Image;

            const counterpointNote = this.exercise.counterpoint.notes[measureNumber];
            if (counterpointNote) {
                const measureNote = this.renderNote(measureCenterX, noteY, { number: measureNumber, note: note })
                this.mainContainer.add(measureNote);
            }

            measureDisplay.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
                const semitones = Math.round(pointer.y / unit);
                const note = new Note(PitchYInSemitones[semitones]);
                const pitchInPixels = semitones * unit - (wholeNoteHeight / 2);
                console.log(`pitch in pixels: ${pitchInPixels} | semitones: ${semitones} | y: ${pointer.y} | note: ${note.toString(true)} | measure: ${measureDisplay.getData(constants.DATA).measureNumber}`);

                if (ghostNote) {
                    ghostNote.destroy();
                }

                ghostNote = this.renderNote(measureCenterX, pitchInPixels, { number: measureNumber, note: note });

                ghostNote.name = `measure ${measureNumber}`;
                ghostNote.alpha = 0.5;
                this.mainContainer.add(ghostNote);
            });

            measureDisplay.on("pointerout", () => {
                ghostNote.destroy();
            });

            measureDisplay.on("pointerdown", () => {
                const semitones = Math.round(ghostNote.y / unit);
                const note = new Note(PitchYInSemitones[semitones]);
                this.exercise.counterpoint.removeNote(measureNumber);
                this.exercise.counterpoint.addNote(measureNumber, note);

                const noteGameObjects = this.mainContainer.list.filter(gameObject => {
                    return gameObject.name === constants.terms.NOTE && gameObject.getData(constants.DATA)?.number === measureNumber;
                });

                if (noteGameObjects.length > 0) {
                    noteGameObjects[0].destroy();
                }
            });
        });
    }

    renderNote(x: number, y: number, measure: Measure) {
        const note = this.add.image(x, y, "musical-symbols", "whole-note.png").setOrigin(0);
        note.name = constants.terms.NOTE;
        note.setData(constants.terms.MEASURE, measure);

        return note;
    }

    createMeasureLine(name: string, measureLeft: number) {
        const line = this.add.line(measureLeft, PitchYInSemitones.f5 * unit, measureLeft, 0, measureLeft, (PitchYInSemitones.e4 - PitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);
        this.mainContainer.add(line);
    }

    renderGhostNote(x: number, y: number) {
        const wholeNoteImage = this.add.image(x, y, "musical-symbols", "whole-note.png").setOrigin(0);
        wholeNoteImage.name = "Whole note";
        //wholeNoteImage.setInteractive();
        this.mainContainer.add(wholeNoteImage);
    }

    renderDiagnosticsScreen() {
        //const camera = this.cameras.main;

        //const help = {
        //    line1: "Cursors to move",
        //    line2: "Q & E to zoom"
        //};

        //const f1 = this.gui.addFolder('Camera');
        //f1.add(camera, 'x').listen();
        //f1.add(camera, 'y').listen();
        //f1.add(camera, 'scrollX').listen();
        //f1.add(camera, 'scrollY').listen();
        //f1.add(camera, 'rotation').min(0).step(0.01).listen();
        //f1.add(camera, 'zoom', 0.1, 2).step(0.1).listen();
        //f1.add(help, 'line1');
        //f1.add(help, 'line2');
        //f1.open();
    }
}