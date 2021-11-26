"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var Phaser = require("phaser");
var main_scene_1 = require("./main-scene");
var gameConfig = {
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
    scene: main_scene_1.default,
    audio: {
        disableWebAudio: true
    }
};
exports.Game = new Phaser.Game(gameConfig);
//# sourceMappingURL=game.js.map