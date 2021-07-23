import Phaser from "phaser";

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
        this.add.image(0, 0, "musical-symbols", "whole-note.png").setOrigin(0);
    }

    public update() {
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