import { Scene } from "phaser";

export class LoadingScene extends Scene {
  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {

  }

  create() {
    // Start game scene
    this.scene.start("GameScene");
  }
}
