import megamanJson from '../assets/megaman.json';
import megamanPng from '../assets/megaman.png';

export default class Megaman {
  constructor(scene) {
    this.scene = scene;
    this.model = {};
    this.cursors = {};
    this.jumpButton = {};
    this.state = {
      firstTouchTheGround: false,
      isDashing: false,
    };
    this.counters = {
      dash: null,
    }
  }

  preload() {
    this.scene.load.atlas(
      'megaman',
      megamanPng,
      megamanJson,
      Phaser.Loader.TEXTURE_ATLAS_JSON_HASH,
    );
  }

  create() {
    this.model = this.scene.physics.add.sprite(0, 0, 'megaman', 'megaman-init/megaman-init-1');
    this.generateAnimations();
    this.generateControls();

    this.model.setOrigin(0.2, 0.61);
    this.model.setScale(0.7);
    this.model.body.setSize(32, 192);

    this.model.setCollideWorldBounds(true);
    this.model.body.setGravityY(900);
  }

  generateAnimations() {
    this.scene.anims.create({
      key: 'megaman-init',
      frames: this.scene.anims.generateFrameNames('megaman', { prefix: 'megaman-init/megaman-init-', start: 1,  end: 5 }),
      frameRate: 12,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'megaman-walk',
      frames: this.scene.anims.generateFrameNames('megaman', { prefix: 'megaman-walk/megaman-walk-', start: 1,  end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'megaman-idle',
      frames: [
        { key: 'megaman', frame: 'megaman-walk/megaman-idle' },
      ],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: 'megaman-jump-up',
      frames: [
        { key: 'megaman', frame: 'megaman-jump/megaman-jump-up' },
      ],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: 'megaman-jump-down',
      frames: [
        { key: 'megaman', frame: 'megaman-jump/megaman-jump-down' },
      ],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: 'megaman-dash',
      frames: [
        { key: 'megaman', frame: 'megaman-dash/megaman-dash' },
      ],
      frameRate: 10,
    });
  }

  generateControls() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.jumpButton = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const comboConfigs = { resetOnMatch: true, maxKeyDelay: 500 };
    const dashRight = this.scene.input.keyboard.createCombo([Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.RIGHT], comboConfigs);
    const dashLeft = this.scene.input.keyboard.createCombo([Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.LEFT], comboConfigs);

    this.scene.input.keyboard.on('keycombomatch', (event) => {
      if ((dashRight.matched || dashLeft.matched) && this.isMegamanTouchingTheGround()) {
        this.state.isDashing = true;
        this.counters.dash = setTimeout(() => {
          this.state.isDashing = false;
        }, 300);

        this.model.anims.play('megaman-dash');
      }
    });
  }

  isMegamanTouchingTheGround() {
    return (this.model.body.onFloor() || this.model.body.touching.down);
  }

  update() {
    this.model.setVelocityX(0);

    if (this.isMegamanTouchingTheGround() && !this.state.firstTouchTheGround) {
      // this.model.anims.play('megaman-init');
      this.model.body.setSize(74, 193);
      this.state.firstTouchTheGround = true;
      return;
    }

    if (!this.state.firstTouchTheGround) {
      return;
    }

    if (this.cursors.right.isDown) {
      if (this.state.isDashing) {
        this.model.setVelocityX(500);
        return;
      }

      this.model.setVelocityX(300);
      this.model.flipX = false;

      if (this.isMegamanTouchingTheGround()) {
        this.model.anims.play('megaman-walk', true);
      }
    }

    if (this.cursors.left.isDown) {
      if (this.state.isDashing) {
        this.model.setVelocityX(-500);
        return;
      }

      this.model.setVelocityX(-300);
      this.model.flipX = true;

      if (this.isMegamanTouchingTheGround()) {
        this.model.anims.play('megaman-walk', true);
      }
    }

    if (
      (this.cursors.up.isDown || this.jumpButton.isDown) &&
      this.isMegamanTouchingTheGround()
    ) {
      this.model.body.setSize(74, 184);
      this.model.setVelocityY(-900);
      this.model.anims.play('megaman-jump-up');
      return;
    }

    if (this.model.body.velocity.y > 0 && !this.isMegamanTouchingTheGround()) {
      this.model.body.setSize(108, 140);
      this.model.anims.play('megaman-jump-down');
      return;
    }

    if (this.model.body.velocity.y === 0 && this.model.body.velocity.x === 0 && this.isMegamanTouchingTheGround()) {
      this.model.anims.play('megaman-idle');
      return;
    }
  }
}
