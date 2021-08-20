import * as Phaser from "phaser";
import MainScene from "./main-scene";

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Counterpoint",
    type: Phaser.AUTO,
    scale: {
        width: 800,
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
    scene: MainScene,
    audio: {
        disableWebAudio: true
    }
};

export const Game = new Phaser.Game(gameConfig);