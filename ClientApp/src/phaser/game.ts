import Phaser from "phaser";

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
        //const wholeNoteImage = this.add.image(0, 0, "musical-symbols", "whole-note.png").setOrigin(0);
        //wholeNoteImage.setInteractive();
        //wholeNoteImage.setData("name", "Whole note");

        this.createGrandStaff();

        

        this.input.on("pointerover", (event: string | symbol, gameObjects: Phaser.GameObjects.GameObject[]) => {
            feedbackText.text = gameObjects[0].name;
        });

        feedbackText = this.add.text(0, 250, "Feedback", { color: "#000000" });
        //this.add.image(0, 20, "musical-symbols", "treble-clef.png").setOrigin(0);
        //this.add.image(0, 120, "musical-symbols", "bass-clef.png").setOrigin(0);
    }

    public update() {
    }

    createGrandStaff() {
        // Treble staff
        const f5Line = this.createLine("f5 line", 40);
        const d5Line = this.createLine("d5 line", 50);
        const b4Line = this.createLine("b4 line", 60);
        const g4Line = this.createLine("g4 line", 70);
        const e4Line = this.createLine("e4 line", 80);

        // Bass staff
        const a3Line = this.createLine("a3 line", 120);
        const f3Line = this.createLine("f3 line", 130);
        const d3Line = this.createLine("d3 line", 140);
        const b2Line = this.createLine("b2 line", 150);
        const g2Line = this.createLine("g2 line", 160);



    }

    createLine(name: string, y: number): Phaser.GameObjects.Line {
        const line = this.add.line(0, y, 0, 0, 300, 0, 0x000000).setOrigin(0);
        line.name = name;
        line.setInteractive();
        //eLine.setLineWidth(5, 5);

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
        width: 400,
        height: 300
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