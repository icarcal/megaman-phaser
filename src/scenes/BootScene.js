import { Scene } from 'phaser'
import platformPNG from '../assets/platform.png';

export default class BootScene extends Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    this.load.image('platform', platformPNG)
  }

  create () {
    this.scene.start('PlayScene')
  }
}
