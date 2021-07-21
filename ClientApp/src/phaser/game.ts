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

    public create() {
        this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
        this.physics.add.existing(this.square);
    }

    public update() {

    }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Counterpoint",
    type: Phaser.AUTO,
    scale: {
        width: 800,
        height: 600
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },
    parent: "game",
    backgroundColor: "#ebd5b3",
    scene: GameScene
};

export const game = new Phaser.Game(gameConfig);