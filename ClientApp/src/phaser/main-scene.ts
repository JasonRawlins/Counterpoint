import * as Phaser from "phaser";
import * as dat from "dat.gui";
import { Exercise, Voice, VoicePosition } from "../music/counterpoint";
import { Clef, Key, Note } from "../music/core";

const screenSize = { width: 675, height: 200 };
const wholeNoteHeight = 12; // The height of the whole note image in pixels. 
const halfWholeNoteHeight = wholeNoteHeight / 2;
const unit = (wholeNoteHeight / screenSize.height) * 100;
const altoClefTopOffset = 18 * unit;

const style = {
    padding: {
        left: 10
    }
};

const pitchYInSemitones = {
    treble: {
        c6: 0,
        b5: 1,
        a5: 2,
        g5: 3,
        f5: 4,
        e5: 5,
        d5: 6,
        c5: 7,
        b4: 8,
        a4: 9,
        g4: 10,
        f4: 11,
        e4: 12,
        d4: 13,
        c4: 14,
        b3: 15,
        a3: 16
    },
    alto: {
        b4: 0,
        a4: 1,
        g4: 2,
        f4: 3,
        e4: 4,
        d4: 5,
        c4: 6,
        b3: 7,
        a3: 8,
        g3: 9,
        f3: 10,
        e3: 11,
        d3: 12
    },
    fromSemitones: (clef: {}, semitones: number) => {
        var clefKey = Object.keys(clef).find(k => (clef as any)[k] as number === semitones);
        return clefKey || "";
    }
}

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

interface MeasureData {
    note: Note,
    number: number,
    isCantusFirmus: boolean
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
        new Voice(VoicePosition.bottom, Clef.alto, "g4 f4 e4 d4", true),
        new Voice(VoicePosition.top, Clef.treble, "b4 c5 d5 e5")
    );

    private measureLeftOffset = 50;
    private measureWidth = 100;
    private leftOffset = style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth;

    constructor() {
        super(sceneConfig);
        this.gui = new dat.GUI();
    }

    public preload() {
        this.load.multiatlas("musical-symbols", "assets/musical-symbols.json", "assets");
        this.load.audio("f3", "assets/audio/f3.mp3");
        this.load.audio("g3", "assets/audio/g3.mp3");
        this.load.audio("a3", "assets/audio/a3.mp3");
        this.load.audio("b3", "assets/audio/b3.mp3");
        this.load.audio("c4", "assets/audio/c4.mp3");
        this.load.audio("d4", "assets/audio/d4.mp3");
        this.load.audio("e4", "assets/audio/e4.mp3");
        this.load.audio("f4", "assets/audio/f4.mp3");
        this.load.audio("g4", "assets/audio/g4.mp3");
        this.load.audio("a4", "assets/audio/a4.mp3");
        this.load.audio("b4", "assets/audio/b4.mp3");
        this.load.audio("c5", "assets/audio/c5.mp3");
        this.load.audio("d5", "assets/audio/d5.mp3");
        this.load.audio("e5", "assets/audio/e5.mp3");
        this.load.audio("f5", "assets/audio/f5.mp3");
        this.load.audio("g5", "assets/audio/g5.mp3");
        this.load.audio("a5", "assets/audio/a5.mp3");
        this.load.audio("b5", "assets/audio/b5.mp3");
        this.load.audio("c6", "assets/audio/c6.mp3");
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
        this.renderTransportControls();

        this.feedbackText = this.add.text(0, 250, "Feedback", { color: "#000000" });
        this.mainContainer.add(this.feedbackText);
    }

    renderTransportControls() {
        const playButton = this.add.triangle(style.padding.left, 30 * unit, 0, 0, 50, 25, 0, 50, 0x00FF00).setOrigin(0);
        playButton.setInteractive();
        playButton.on("pointerdown", () => {
            let measureNumber = 0;
            const intervalHandle = setInterval(() => {
                const cantusFirmusNoteSound = this.sound.add(this.exercise.cantusFirmus.notes[measureNumber].toString());
                const counterpointNoteSound = this.sound.add(this.exercise.counterpoint.notes[measureNumber].toString());

                cantusFirmusNoteSound.play();
                counterpointNoteSound.play();

                measureNumber++;
                if (measureNumber >= this.exercise.cantusFirmus.notes.length) {
                    clearInterval(intervalHandle);
                }
            }, 500);
        });

        this.mainContainer.add(playButton);
    }

    public update(time: number, delta: number) {
        this.controls.update(delta);
    }

    renderGrandStaff() {
        const grandStaffTop = pitchYInSemitones.treble.f5 * unit;
        const grandStaffBottom = grandStaffTop + altoClefTopOffset + (pitchYInSemitones.treble.e4 - pitchYInSemitones.alto.f3) * unit;

        const beginningBarLine = this.add.line(style.padding.left, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);
        const endBarline1 = this.add.line(this.leftOffset + 7, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);
        endBarline1.setLineWidth(3);
        const endBarline2 = this.add.line(this.leftOffset, grandStaffTop, 0, 0, 0, grandStaffBottom, 0x000000).setOrigin(0);

        // TODO: What is 6.1?
        const trebleTimeSignature = this.add.image(9.5 * unit, 6.1 * unit, "musical-symbols", "common-time.png").setOrigin(0);
        const trebleTimeSignatureToWholeNoteRatio = 0.155;
        trebleTimeSignature.setScale(trebleTimeSignatureToWholeNoteRatio * unit);

        // Treble staff
        // TODO: What is 1.3?
        const trebleClef = this.add.image(3 * unit, 1.3 * unit, "musical-symbols", "treble-clef.png").setOrigin(0);
        const trebleClefToWholeNoteRatio = 0.166;
        trebleClef.setScale(trebleClefToWholeNoteRatio * unit);

        const trebleF5Line = this.createStaffLine(pitchYInSemitones.treble.f5);
        const trebleD5Line = this.createStaffLine(pitchYInSemitones.treble.d5);
        const trebleB4Line = this.createStaffLine(pitchYInSemitones.treble.b4);
        const trebleG4Line = this.createStaffLine(pitchYInSemitones.treble.g4);
        const trebleE4Line = this.createStaffLine(pitchYInSemitones.treble.e4);

        // Alto clef
        // TODO: What is 4.1?
        const altoTimeSignature = this.add.image(9.5 * unit, altoClefTopOffset + 4.1 * unit, "musical-symbols", "common-time.png").setOrigin(0);
        const altoTimeSignatureToWholeNoteRatio = 0.155;
        altoTimeSignature.setScale(altoTimeSignatureToWholeNoteRatio * unit);

        // TODO: What is 2?
        const altoClef = this.add.image(3 * unit, altoClefTopOffset + 2 * unit, "musical-symbols", "alto-clef.png").setOrigin(0);
        const altoClefToWholeNoteRatio = 0.153;
        altoClef.setScale(altoClefToWholeNoteRatio * unit);

        const altoG4Line = this.createStaffLine(pitchYInSemitones.alto.g4, altoClefTopOffset);
        const altoE4Line = this.createStaffLine(pitchYInSemitones.alto.e4, altoClefTopOffset);
        const altoC4Line = this.createStaffLine(pitchYInSemitones.alto.c4, altoClefTopOffset);
        const altoA4Line = this.createStaffLine(pitchYInSemitones.alto.a3, altoClefTopOffset);
        const altoF3Line = this.createStaffLine(pitchYInSemitones.alto.f3, altoClefTopOffset);

        this.mainContainer.add([
            beginningBarLine,
            trebleClef,
            trebleF5Line, trebleD5Line, trebleB4Line, trebleG4Line, trebleE4Line,
            altoClef,
            altoG4Line, altoE4Line, altoC4Line, altoA4Line, altoF3Line,
            endBarline1, endBarline2
        ]);
    }

    createStaffLine(pitchYInSemitones: number, yOffset: number = 0) {
        return this.add.line(style.padding.left, pitchYInSemitones * unit + yOffset, 0, 0, this.leftOffset, 0, 0x000000).setOrigin(0);
    }

    renderMeasures() {
        this.exercise.cantusFirmus.notes.forEach((note: Note, measureNumber: number) => {
            const measureLeft = style.padding.left + this.measureLeftOffset + this.measureWidth * measureNumber;
            const measureCenterX = (measureLeft + this.measureWidth / 2) - 2 * unit;
            const noteY = altoClefTopOffset + ((pitchYInSemitones.alto as any)[note.toString()] as number) * unit - halfWholeNoteHeight;

            if (measureNumber > 0) {
                const measureBottom = (pitchYInSemitones.alto.f3 - pitchYInSemitones.alto.g4) * unit;
                const line = this.add.line(measureLeft, altoClefTopOffset + pitchYInSemitones.alto.g4 * unit, 0, 0, 0, measureBottom, 0x000000).setOrigin(0);
                this.mainContainer.add(line);
            }

            const measureCantusFirmusNote = this.renderNote(measureCenterX, noteY, { number: measureNumber, note: note, isCantusFirmus: true })
            this.mainContainer.add(measureCantusFirmusNote);
        });

        this.exercise.counterpoint.notes.forEach((note: Note, measureNumber: number) => {
            const measureLeft = style.padding.left + this.measureLeftOffset + this.measureWidth * measureNumber;
            const measureDisplay = this.add.rectangle(measureLeft, 0, this.measureWidth, (pitchYInSemitones.treble.a3 - pitchYInSemitones.treble.c6) * unit, 0xffffff).setOrigin(0);
            const measureCenterX = (measureDisplay.x + this.measureWidth / 2) - 2 * unit;
            const noteY = ((pitchYInSemitones.treble as any)[note.toString()] as number) * unit - halfWholeNoteHeight;

            measureDisplay.setInteractive();
            measureDisplay.setAlpha(0.2);
            measureDisplay.name = `measure ${measureNumber} | note ${note.toString()}`;
            measureDisplay.setData(constants.terms.MEASURE, { number: measureNumber, note: note });

            this.mainContainer.add(measureDisplay);

            if (measureNumber > 0) {
                const measureBottom = (pitchYInSemitones.treble.e4 - pitchYInSemitones.treble.f5) * unit;
                const line = this.add.line(measureLeft, pitchYInSemitones.treble.f5 * unit, 0, 0, 0, measureBottom, 0x000000).setOrigin(0);
                this.mainContainer.add(line);
            }

            let ghostNote: Phaser.GameObjects.Image;

            const counterpointNote = this.exercise.counterpoint.notes[measureNumber];
            if (counterpointNote) {
                const measureCounterpointNote = this.renderNote(measureCenterX, noteY, { number: measureNumber, note: note, isCantusFirmus: false })
                this.mainContainer.add(measureCounterpointNote);
            }

            measureDisplay.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
                const semitones = Math.round(pointer.y / unit);
                const note = new Note(pitchYInSemitones.fromSemitones(pitchYInSemitones.treble, semitones));
                const pitchInPixels = semitones * unit - halfWholeNoteHeight;

                if (ghostNote) {
                    ghostNote.destroy();
                }

                ghostNote = this.renderNote(measureCenterX, pitchInPixels, { number: measureNumber, note: note, isCantusFirmus: false });

                ghostNote.name = `measure ${measureNumber}`;
                ghostNote.alpha = 0.5;
                this.mainContainer.add(ghostNote);
            });

            measureDisplay.on("pointerout", () => {
                ghostNote.destroy();
            });

            measureDisplay.on("pointerdown", () => {
                const semitones = Math.round((ghostNote.y + halfWholeNoteHeight) / unit);
                const note = new Note(pitchYInSemitones.fromSemitones(pitchYInSemitones.treble, semitones));
                const pitchInPixels = semitones * unit - halfWholeNoteHeight;
                this.exercise.counterpoint.removeNote(measureNumber);
                this.exercise.counterpoint.addNote(measureNumber, note);

                const placedNoteSound = this.sound.add(note.toString());
                placedNoteSound.play();

                const noteGameObjects = this.mainContainer.list.filter(gameObject => {
                    if (gameObject.name !== constants.terms.NOTE)
                        return false;

                    const measureData = gameObject.getData(constants.terms.MEASURE) as MeasureData;
                    return measureData && measureData.number === measureNumber && !measureData.isCantusFirmus;
                });

                if (noteGameObjects.length > 0) {
                    noteGameObjects[0].destroy();
                }

                this.mainContainer.add(this.renderNote(measureCenterX, pitchInPixels, { number: measureNumber, note: note, isCantusFirmus: false }));
            });
        });
    }

    renderNote(x: number, y: number, measure: MeasureData) {
        const note = this.add.image(x, y, "musical-symbols", "whole-note.png").setOrigin(0);
        note.name = constants.terms.NOTE;
        note.setData(constants.terms.MEASURE, measure);

        return note;
    }

    renderGhostNote(x: number, y: number) {
        const wholeNoteImage = this.add.image(x, y, "musical-symbols", "whole-note.png").setOrigin(0);
        wholeNoteImage.name = "Whole note";
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