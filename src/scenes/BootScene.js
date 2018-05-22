import { Scene } from 'phaser'

export default class BootScene extends Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {}

  create () {
    this.scene.start('PlayScene')
  }
}
