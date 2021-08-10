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

enum pitchYInSemitones { 
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

const C = { // Constants. C is for brevity.
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
        NOTE: "NOTE",
        PITCH: "PITCH"
    }
};

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
        new Voice(VoicePosition.top, Clef.treble, "g4 a4 b4 c4")
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
        const beginningBarLine = this.add.line(style.padding.left, pitchYInSemitones.f5 * unit, 0, 0, 0, (pitchYInSemitones.e4 - pitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);

        const trebleClef = this.add.image(unit * 3, unit * 1.3, "musical-symbols", "treble-clef.png").setOrigin(0);
        const trebleClefToWholeNoteRatio = 0.168;
        trebleClef.setScale(trebleClefToWholeNoteRatio * unit);

        // Treble staff
        const f5Line = this.createStaffLine("f5 line", pitchYInSemitones.f5);
        const d5Line = this.createStaffLine("d5 line", pitchYInSemitones.d5);
        const b4Line = this.createStaffLine("b4 line", pitchYInSemitones.b4);
        const g4Line = this.createStaffLine("g4 line", pitchYInSemitones.g4);
        const e4Line = this.createStaffLine("e4 line", pitchYInSemitones.e4);

        const doubleBarSpacing = 4;
        const endBarline1 = this.add.line(style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth, pitchYInSemitones.f5 * unit, 0, 0, 0, (pitchYInSemitones.e4 - pitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);
        const endBarline2 = this.add.line(style.padding.left + this.measureLeftOffset + this.exercise.length * this.measureWidth - doubleBarSpacing, pitchYInSemitones.f5 * unit, 0, 0, 0, (pitchYInSemitones.e4 - pitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);

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
        this.exercise.cantusFirmus.notes.forEach((note: Note, measureNumber: number) => {
            const measureLeft = this.measureLeftOffset + this.measureWidth * measureNumber;
            const measureDisplay = this.add.rectangle(measureLeft, 0, this.measureWidth, (pitchYInSemitones.a3 - pitchYInSemitones.c6) * unit, 0xffffff).setOrigin(0);

            measureDisplay.setInteractive();
            measureDisplay.setAlpha(0.5);
            measureDisplay.name = `measure ${measureNumber} | note ${note.toString()}`;
            measureDisplay.setData({ note: note, measureNumber: measureNumber });

            this.mainContainer.add(measureDisplay);

            if (measureNumber > 0) {
                this.createMeasureLine("", measureLeft / 2);
            }

            let ghostNote: Phaser.GameObjects.Image;

            measureDisplay.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
                const semitones = Math.round(pointer.y / unit);
                const pitchYKey = pitchYInSemitones[semitones];
                const pitchInPixels = semitones * unit - (wholeNoteHeight / 2);
                console.log(`pitch in pixels: ${pitchInPixels} | semitones: ${semitones} | y: ${pointer.y} | pitch y key: ${pitchYKey}`);

                if (ghostNote) {
                    ghostNote.destroy();
                }

                ghostNote = this.add.image(
                    (measureDisplay.x + this.measureWidth / 2) - wholeNoteHeight,
                    pitchInPixels,
                    "musical-symbols", "whole-note.png").setOrigin(0);

                ghostNote.name = `measure ${measureNumber}`;
                ghostNote.alpha = 0.5;
                this.mainContainer.add(ghostNote);
            });

            measureDisplay.on("pointerout", () => {
                ghostNote.destroy();
            });

            //pitchOverlay.on("pointerdown", () => {
            //    let destroyedNote = "";

            //    this.mainContainer.list.forEach(gameObject => {
            //        if (gameObject.name === C.terms.NOTE) {
            //            destroyedNote = gameObject.getData(C.terms.PITCH);
            //            gameObject.destroy();
            //        }
            //    });

            //    if (pitch !== destroyedNote) {
            //        const newNote = this.add.image(ghostNote.x, ghostNote.y, "musical-symbols", "whole-note.png").setOrigin(0);
            //        newNote.name = C.terms.NOTE;
            //        newNote.setData(C.terms.PITCH, pitch);

            //        this.mainContainer.add(newNote);
            //    }
            //});
        });
    }

    createMeasureLine(name: string, measureLeft: number) {
        const line = this.add.line(measureLeft, pitchYInSemitones.f5 * unit, measureLeft, 0, measureLeft, (pitchYInSemitones.e4 - pitchYInSemitones.f5) * unit, 0x000000).setOrigin(0);
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