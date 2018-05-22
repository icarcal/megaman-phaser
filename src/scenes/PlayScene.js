import { Scene } from 'phaser';
import megamanPng from '../assets/megaman.png';
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
    this.load.atlas(
      'megaman',
      megamanPng,
      megamanJson,
      Phaser.Loader.TEXTURE_ATLAS_JSON_HASH,
    );
    // this.load.image('platform', 'src/assets/platform.png');
  }

  create() {
    this.megaman = this.physics.add.sprite(0, 0, 'megaman', 'megaman-init/megaman-init-1')
console.log(this.anims.generateFrameNumbers('megaman', { start: 1,  end: 5 }));
    this.anims.create({
      key: 'megaman-init',
      frames: this.anims.generateFrameNumbers('megaman-init/megaman-init-', { start: 1,  end: 5 }),
      frameRate: 24,
      repeat: 0,
    });
    this.anims.create({
      key: 'megaman-walk',
      frames: this.anims.generateFrameNumbers('megaman-walk/megaman-walk-', { start: 1,  end: 7 }),
      frameRate: 10,
      repeat: 1,
    });

    this.megaman.setOrigin(0.5, 0);
    this.megaman.setScale(0.7);

    this.megaman.setCollideWorldBounds(true);
    this.megaman.body.setGravityY(1000);

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(500, 150, 'platform');
    this.platforms.create(-200, 300, 'platform');
    this.platforms.create(400, 450, 'platform');

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.megaman.anims.play('megaman-init');
  }

  update() {
    this.physics.add.collider(this.megaman, this.platforms);
    this.megaman.setVelocityX(0);

    if (this.cursors.right.isDown) {
      this.megaman.flipX();
      this.megaman.setVelocityX(200);

      if (this.IsMegamanTouchingTheGround()) {
        this.megaman.body.setSize(118, 140);
        this.megaman.anims.play('megaman-walk');
      }
    }

    if (this.cursors.left.isDown) {
      this.megaman.flipX();
      this.megaman.setVelocityX(-200);

      if (this.IsMegamanTouchingTheGround()) {
        this.megaman.body.setSize(118, 140);
        this.megaman.anims.play('megaman-walk');
      }
    }

    if (
      (this.cursors.up.isDown || this.jumpButton.isDown) &&
      this.IsMegamanTouchingTheGround()
    ) {
      this.megaman.body.setSize(74, 184);
      this.megaman.setVelocityY(-600);
      this.megaman.sprite('megaman', 'megaman-jump/megaman-jump-up');
      return;
    }

    if (this.megaman.body.velocity.y > 0 && !this.IsMegamanTouchingTheGround()) {
      this.megaman.body.setSize(108, 140);
      this.megaman.sprite('megaman', 'megaman-jump/megaman-jump-down');
      return;
    }

    if (this.megaman.body.velocity.y === 0 && this.IsMegamanTouchingTheGround()) {
      this.megaman.body.setSize(118, 140);
      this.megaman.sprite('megaman', 'megaman-walk/megaman-idle');
      return;
    }
  }

  render() {
    // game.debug.body(megaman);
    // game.debug.spriteBounds(megaman);
    // game.debug.spriteBounds(platforms);
    // game.debug.spriteInfo(megaman);
  }
}
