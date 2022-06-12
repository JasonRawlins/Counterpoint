import { Component, OnInit } from '@angular/core';
import * as Phaser from "phaser";
import { zip } from 'rxjs';
import MainScene from "../../phaser/main-scene";

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      title: "Counterpoint",
      type: Phaser.AUTO,
      scale: {
<<<<<<< HEAD
        width: 700,
=======
        width: 800,
>>>>>>> fde3ad7 (Had to recreate the app so I could publish to aws. Otherwise no changes.)
        height: 300
      },
      physics: {
        default: "arcade",
        arcade: {
          debug: true
        }
      },
      parent: "phaser",
<<<<<<< HEAD
      backgroundColor: "#ffffff",
=======
      backgroundColor: "#ebd5b3",
>>>>>>> fde3ad7 (Had to recreate the app so I could publish to aws. Otherwise no changes.)
      scene: MainScene,
      audio: {
        disableWebAudio: true
      }
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
