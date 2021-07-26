import Phaser from "phaser";

const screenSize = { width: 675, height: 200 };
// These are the w x h dimensions of the whole note image, which will be used 
// to calculate all other measurements as a percentage of the whole note width.
const wholeNoteImageHieght = 12;
const unit = (wholeNoteImageHieght / screenSize.height) * 100;

let feedbackText: Phaser.GameObjects.Text;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game"
};

export class GameScene extends Phaser.Scene {
    private square!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

    constructor() {
        super(sceneConfig);
    }

    public preload() {
        this.load.multiatlas("musical-symbols", "assets/musical-symbols.json", "assets");
    }

    public create() {
        const wholeNoteImage = this.add.image(0, 0, "musical-symbols", "whole-note.png").setOrigin(0);
        wholeNoteImage.name = "Whole note";
        wholeNoteImage.setInteractive();

        this.createGrandStaff();

        

        this.input.on("pointerover", (event: string | symbol, gameObjects: Phaser.GameObjects.GameObject[]) => {
            feedbackText.text = gameObjects[0].name;
        });

        feedbackText = this.add.text(0, 250, "Feedback", { color: "#000000" });
    }

    public update() {
    }

    createGrandStaff() {
        // Treble staff
        const topOfStaff = unit * 5;
        const f5Line = this.createLine("f5 line", topOfStaff + unit * 2);
        const d5Line = this.createLine("d5 line", topOfStaff + unit * 4);
        const b4Line = this.createLine("b4 line", topOfStaff + unit * 6);
        const g4Line = this.createLine("g4 line", topOfStaff + unit * 8);
        const e4Line = this.createLine("e4 line", topOfStaff + unit * 10);
        
        var trebleClef = this.add.image(unit * 3, unit, "musical-symbols", "treble-clef.png").setOrigin(0);
        trebleClef.setScale(1.32);


        // Bass staff
        //const a3Line = this.createLine("a3 line", 120);
        //const f3Line = this.createLine("f3 line", 130);
        //const d3Line = this.createLine("d3 line", 140);
        //const b2Line = this.createLine("b2 line", 150);
        //const g2Line = this.createLine("g2 line", 160);
        //this.add.image(13, 120, "musical-symbols", "bass-clef.png").setOrigin(0);

    }

    createLine(name: string, y: number) {
        const line = this.add.line(10, y, 0, 0, 300, 0, 0x000000).setOrigin(0);
        line.name = name;
        line.setInteractive();
        line.setLineWidth(1);

        return line;
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