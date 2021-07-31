import Phaser from "phaser";
import * as dat from "dat.gui";
import { Exercise, Voice, VoicePosition } from "../music/counterpoint";
import { Clef, Key } from "../music/core";

const screenSize = { width: 675, height: 200 };
const screenLeftOffset = 10;
// These are the w x h dimensions of the whole note image, which will be used 
// to calculate all other measurements as a percentage of the whole note width.
const wholeNoteHeight = 12;
const unit = (wholeNoteHeight / screenSize.height) * 100;
const f5Top = unit * 5;

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

let feedbackText: Phaser.GameObjects.Text;

const exercise = new Exercise(Key.c,
    new Voice(VoicePosition.bottom, Clef.bass, "e4 f4 gf", true),
    new Voice(VoicePosition.top, Clef.treble, "g4 a4 b4")
);

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game"
};

export class GameScene extends Phaser.Scene {
    private controls!: Phaser.Cameras.Controls.SmoothedKeyControl;
    private mainContainer!: Phaser.GameObjects.Container;
    private gui: dat.GUI;

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

        this.input.on("pointerover", (event: string | symbol, gameObjects: Phaser.GameObjects.GameObject[]) => {
            /*console.log(gameObjects[0].name);*/
            feedbackText.text = gameObjects[0].name;
        });

        feedbackText = this.add.text(0, 150, "Feedback", { color: "#000000" });
        this.mainContainer.add(feedbackText);
    }

    public update(time: number, delta: number) {
        this.controls.update(delta);
    }

    renderGrandStaff() {
        const f5Overlay = this.createPitchOverlay(C.pitch.F5, 4, 0xaaaaaa);
        const e5Overlay = this.createPitchOverlay(C.pitch.E5, 6, 0xbbbbbb);
        const d5Overlay = this.createPitchOverlay(C.pitch.D5, 8, 0xaaaaaa);
        const c5Overlay = this.createPitchOverlay(C.pitch.C5, 10, 0xbbbbbb);
        const b4Overlay = this.createPitchOverlay(C.pitch.B4, 12, 0xaaaaaa);
        const a4Overlay = this.createPitchOverlay(C.pitch.A4, 14, 0xbbbbbb);
        const g4Overlay = this.createPitchOverlay(C.pitch.G4, 16, 0xaaaaaa);
        const f4Overlay = this.createPitchOverlay(C.pitch.F4, 18, 0xbbbbbb);
        const e4Overlay = this.createPitchOverlay(C.pitch.E4, 20, 0xaaaaaa);
        const d4Overlay = this.createPitchOverlay(C.pitch.D4, 22, 0xbbbbbb);

        // Treble staff
        const f5Line = this.createStaffLine("f5 line", 4);
        const d5Line = this.createStaffLine("d5 line", 8);
        const b4Line = this.createStaffLine("b4 line", 12);
        const g4Line = this.createStaffLine("g4 line", 16);
        const e4Line = this.createStaffLine("e4 line", 20);

        var trebleClef = this.add.image(unit * 3, unit, "musical-symbols", "treble-clef.png").setOrigin(0);
        trebleClef.setScale(1.32);

        this.mainContainer.add([
            f5Overlay, e5Overlay, d5Overlay, c5Overlay, b4Overlay, a4Overlay, g4Overlay, f4Overlay, e4Overlay, d4Overlay,
            f5Line, d5Line, b4Line, g4Line, e4Line, trebleClef]);
    }

    createStaffLine(name: string, yOffsetMultiplier: number) {
        const line = this.add.line(screenLeftOffset, f5Top + unit * yOffsetMultiplier, 0, 0, 300, 0, 0x000000).setOrigin(0);
        line.name = name;
        line.setLineWidth(1);

        return line;
    }

    createPitchOverlay(pitch: string, yOffsetMultiplier: number, color: number) {
        const pitchOverlay = this.add.rectangle(screenLeftOffset + 10, (f5Top + unit * yOffsetMultiplier) - (wholeNoteHeight / 2), 100, wholeNoteHeight, color).setOrigin(0);
        pitchOverlay.setInteractive();
        pitchOverlay.name = pitch;

        let ghostNote: Phaser.GameObjects.Image;

        pitchOverlay.on("pointerover", () => {
            ghostNote = this.add.image(pitchOverlay.x, pitchOverlay.y, "musical-symbols", "whole-note.png").setOrigin(0);
            ghostNote.name = pitch;
            ghostNote.alpha = 0.5;
            this.mainContainer.add(ghostNote);
        });

        pitchOverlay.on("pointerout", () => {
            ghostNote.destroy();
        });

        pitchOverlay.on("pointerdown", () => {
            let destroyedNote = "";
            
            this.mainContainer.list.forEach(gameObject => {
                if (gameObject.name === C.terms.NOTE) {
                    destroyedNote = gameObject.getData(C.terms.PITCH);
                    gameObject.destroy();
                }
            });

            if (pitch !== destroyedNote) {
                const newNote = this.add.image(ghostNote.x, ghostNote.y, "musical-symbols", "whole-note.png").setOrigin(0);
                newNote.name = C.terms.NOTE;
                newNote.setData(C.terms.PITCH, pitch);

                this.mainContainer.add(newNote);
            }
        });

        return pitchOverlay;
    }

    renderGhostNote(x: number, y: number) {
        const wholeNoteImage = this.add.image(x, y, "musical-symbols", "whole-note.png").setOrigin(0);
        wholeNoteImage.name = "Whole note";
        wholeNoteImage.setInteractive();
        this.mainContainer.add(wholeNoteImage);
    }

    renderMeasures() {
        exercise.cantusFirmus.notes.forEach((note, index) => {
            const measure = this.add.rectangle(50 * index, f5Top, 40, 40, 0x00ff00).setOrigin(0);
        });
    }

    renderDiagnosticsScreen() {
        const camera = this.cameras.main;

        const help = {
            line1: "Cursors to move",
            line2: "Q & E to zoom"
        };

        const f1 = this.gui.addFolder('Camera');
        f1.add(camera, 'x').listen();
        f1.add(camera, 'y').listen();
        f1.add(camera, 'scrollX').listen();
        f1.add(camera, 'scrollY').listen();
        f1.add(camera, 'rotation').min(0).step(0.01).listen();
        f1.add(camera, 'zoom', 0.1, 2).step(0.1).listen();
        f1.add(help, 'line1');
        f1.add(help, 'line2');
        f1.open();
    }

    public onObjectClicked(event: string | symbol, gameObject: Phaser.GameObjects.Image) {
        feedbackText.text = "Clicked";
    }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Counterpoint",
    type: Phaser.AUTO,
    scale: {
        width: screenSize.width,
        height: screenSize.height
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },
    parent: "phaser",
    backgroundColor: "#ebd5b3",
    scene: GameScene
};

export const Game = new Phaser.Game(gameConfig);