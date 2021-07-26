"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var game_1 = require("../phaser/game");
var x = game_1.Game.scene.isActive; // Hack to get phaser script onto page.
var Home = function () { return (React.createElement("div", null,
    React.createElement("div", { id: "phaser" }))); };
exports.default = react_redux_1.connect()(Home);
//# sourceMappingURL=Home.js.map