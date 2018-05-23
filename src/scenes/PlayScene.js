import { Scene } from 'phaser';
import megamanPng from '../assets/megaman.png';
import platformPNG from '../assets/platform.png';
import megamanJson from '../assets/megaman.json';

export default class PlayScene extends Scene {
  constructor() {
    super({ key: 'PlayScene' });
    this.megaman = {};
    this.platforms = {};
    this.cursors = {};
    this.jumpButton = {};
  }

  IsMegamanTouchingTheGround() {
    return (this.megaman.body.onFloor() || this.megaman.body.touching.down);
}

  preload() {
    console.log(platformPNG);
    this.load.atlas(
      'megaman',
      megamanPng,
      megamanJson,
      Phaser.Loader.TEXTURE_ATLAS_JSON_HASH,
    );

    // this.load.image('platform', platformPNG);
  }

  create() {
    this.megaman = this.physics.add.sprite(0, 0, 'megaman', 'megaman-init/megaman-init-1')

    this.anims.create({
      key: 'megaman-init',
      frames: this.anims.generateFrameNames('megaman', { prefix: 'megaman-init/megaman-init-', start: 1,  end: 5 }),
      frameRate: 24,
    });

    this.anims.create({
      key: 'megaman-walk',
      frames: this.anims.generateFrameNames('megaman', { prefix: 'megaman-walk/megaman-walk-', start: 1,  end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'megaman-idle',
      frames: [
        { key: 'megaman', frame: 'megaman-walk/megaman-idle' },
      ],
      frameRate: 10,
    });

    this.anims.create({
      key: 'megaman-jump-up',
      frames: [
        { key: 'megaman', frame: 'megaman-jump/megaman-jump-up' },
      ],
      frameRate: 10,
    });

    this.anims.create({
      key: 'megaman-jump-down',
      frames: [
        { key: 'megaman', frame: 'megaman-jump/megaman-jump-down' },
      ],
      frameRate: 10,
    });

    this.megaman.setOrigin(0.2, 0.61);
    this.megaman.setScale(0.7);

    this.megaman.setCollideWorldBounds(true);
    this.megaman.body.setGravityY(1000);

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // this.megaman.anims.play('megaman-init');
    console.log(this.megaman);
  }

  update() {
    this.physics.add.collider(this.megaman, this.platforms);
    this.megaman.setVelocityX(0);

    if (this.cursors.right.isDown) {
      this.megaman.setVelocityX(200);
      this.megaman.flipX = false;

      if (this.IsMegamanTouchingTheGround()) {
        this.megaman.anims.play('megaman-walk', true);
      }
    }

    if (this.cursors.left.isDown) {
      this.megaman.setVelocityX(-200);
      this.megaman.flipX = true;

      if (this.IsMegamanTouchingTheGround()) {
        this.megaman.anims.play('megaman-walk', true);
      }
    }

    if (
      (this.cursors.up.isDown || this.jumpButton.isDown) &&
      this.IsMegamanTouchingTheGround()
    ) {
      this.megaman.body.setSize(74, 184);
      this.megaman.setVelocityY(-1000);
      this.megaman.anims.play('megaman-jump-up');
      return;
    }

    if (this.megaman.body.velocity.y > 0 && !this.IsMegamanTouchingTheGround()) {
      this.megaman.body.setSize(108, 140);
      this.megaman.anims.play('megaman-jump-down');
      return;
    }

    if (this.megaman.body.velocity.y === 0 && this.megaman.body.velocity.x === 0 && this.IsMegamanTouchingTheGround()) {
      this.megaman.anims.play('megaman-idle');
      return;
    }
  }

  render() {
    this.game.debug.body(this.megaman);
    this.game.debug.spriteBounds(this.megaman);
    this.game.debug.spriteBounds(this.platforms);
    this.game.debug.spriteInfo(this.megaman);
  }
}
