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
        const wholeNoteImage = this.add.image(0, 0, "musical-symbols", "whole-note.png").setOrigin(0);
        wholeNoteImage.setInteractive();
        wholeNoteImage.setData("name", "Whole note");
        this.input.on("pointerover", (event: string | symbol, gameObject: Phaser.GameObjects.Image[]) => {
            feedbackText.text = gameObject[0].getData("name");
        });
        feedbackText = this.add.text(0, 250, "Feedback");
        //this.add.image(0, 20, "musical-symbols", "treble-clef.png").setOrigin(0);
        //this.add.image(0, 120, "musical-symbols", "bass-clef.png").setOrigin(0);
    }

    public update() {
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