import { Scene } from 'phaser';
import platformPNG from '../assets/platform.png';
import Megaman from '../models/Megaman';
export default class PlayScene extends Scene {
  constructor() {
    super({ key: 'PlayScene' });
    this.megaman = new Megaman(this);
  }

  preload() {
    this.megaman.preload();
    this.load.image('platform', platformPNG);
  }

  create() {
    this.megaman.create();

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');
  }

  update() {
    this.physics.add.collider(this.megaman.model, this.platforms);
    this.megaman.update();
  }

  render() {
    this.game.debug.body(this.megaman);
    this.game.debug.spriteBounds(this.megaman);
    this.game.debug.spriteBounds(this.platforms);
    this.game.debug.spriteInfo(this.megaman);
  }
}
