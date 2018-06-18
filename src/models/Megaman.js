import megamanJson from '../assets/megaman.json';
import megamanPng from '../assets/megaman.png';

export const NORMAL_VELOCITY = 250;
export const DASH_VELOCITY = 800;
export const JUMP_VELOCITY = 900;

export default class Megaman {
  constructor(scene) {
    this.scene = scene;
    this.model = {};
    this.cursors = {};
    this.jumpButton = {};
    this.state = {
      firstTouchTheGround: false,
      originFixed: false,
      isDashing: false,
      isInitialized: false,
      isShooting: false,
    };
    this.counters = {
      dash: null,
      shooting: null,
    };
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
    this.model = this.scene.physics.add.sprite(
      100,
      0,
      'megaman',
      'megaman-init/megaman-init-1.png',
    );
    this.generateAnimations();
    this.generateControls();

    this.model.setScale(0.7);
    this.model.body.setSize(74, 160);
    this.model.setOrigin(0.5, 0.61);

    this.model.setCollideWorldBounds(true);
    this.model.body.setGravityY(900);
  }

  generateAnimations() {
    this.scene.anims.create({
      key: 'megaman-init',
      frames: [
        ...this.scene.anims.generateFrameNames('megaman', {
          prefix: 'megaman-init/megaman-init-',
          suffix: '.png',
          start: 1,
          end: 5,
        }),
        { key: 'megaman', frame: 'megaman-walk/chaac-walk-1.png' },
      ],
      frameRate: 15,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-walk',
      frames: this.scene.anims.generateFrameNames('megaman', {
        prefix: 'megaman-walk/chaac-walk-',
        suffix: '.png',
        start: 1,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'megaman-idle',
      frames: [{ key: 'megaman', frame: 'megaman-walk/chaac-walk-1.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-jump-up',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-up.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-jump-up-blaster',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-up-shooting.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-jump-down',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-down.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-jump-down-blaster',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-down-shooting.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-dash',
      frames: [{ key: 'megaman', frame: 'megaman-dash/megaman-dash.png' }],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-blaster-idle',
      frames: [
        { key: 'megaman', frame: 'megaman-shooting/megaman-shooting-idle.png' },
      ],
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: 'megaman-walk-blaster',
      frames: this.scene.anims.generateFrameNames('megaman', {
        prefix: 'megaman-shooting/megaman-shooting-',
        suffix: '.png',
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.model.on(
      'animationcomplete',
      function(animation) {
        if (animation.key === 'megaman-init') {
          this.state.isInitialized = true;
        }
      },
      this,
    );
  }

  generateControls() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.jumpButton = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.blasterButton = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z,
    );

    const comboConfigs = { resetOnMatch: true, maxKeyDelay: 500 };
    const dashRight = this.scene.input.keyboard.createCombo(
      [
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ],
      comboConfigs,
    );
    const dashLeft = this.scene.input.keyboard.createCombo(
      [
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
      ],
      comboConfigs,
    );

    this.scene.input.keyboard.on('keycombomatch', event => {
      if (
        (dashRight.matched || dashLeft.matched) &&
        this._isMegamanTouchingTheGround()
      ) {
        this.state.isDashing = true;
        this.counters.dash = setTimeout(() => {
          if (this._isMegamanTouchingTheGround()) {
            this.state.isDashing = false;
          }

          this.counters.dash = null;
        }, 300);

        this.model.anims.play('megaman-dash');
      }
    });
  }

  _isMegamanTouchingTheGround() {
    return this.model.body.onFloor() || this.model.body.touching.down;
  }

  _fixOrigin() {
    if (!this.state.originFixed) {
      this.model.setOrigin(0.2, 0.61);
      this.state.originFixed = true;
    }
  }

  _setShootingState() {
    this.state.isShooting = true;
    if (this.counters.shooting) {
      clearTimeout(this.counters.shooting);
    }

    this.counters.shooting = setTimeout(() => {
      this.state.isShooting = false;
    }, 300);
  }

  _megamanShouldDisplayWalkingAnimation() {
    if (this._isMegamanTouchingTheGround() && !this.state.isDashing) {
      if (!this.state.isShooting) {
        this.model.anims.play('megaman-walk', true);
      } else {
        this.model.anims.play('megaman-walk-blaster', true);
      }

      return true;
    }

    return false;
  }

  update() {
    if (this._isMegamanTouchingTheGround() && !this.state.firstTouchTheGround) {
      this.state.firstTouchTheGround = true;
      this.model.anims.play('megaman-init');
      return;
    }

    if (!this.state.firstTouchTheGround || !this.state.isInitialized) {
      return;
    }

    if (this.state.isDashing) {
      let dashVelocity = this.model.flipX ? -DASH_VELOCITY : DASH_VELOCITY;
      this.model.setVelocityX(dashVelocity);

      if (!this.counters.dash && this._isMegamanTouchingTheGround()) {
        this.state.isDashing = false;
      }
    } else {
      this.model.setVelocityX(0);
    }

    if (this.blasterButton.isDown) {
      this._setShootingState();
    }

    if (
      (this.cursors.up.isDown || this.jumpButton.isDown) &&
      this._isMegamanTouchingTheGround()
    ) {
      this.model.body.setSize(74, 184);
      this._fixOrigin();
      this.model.setVelocityY(-JUMP_VELOCITY);

      if (this.state.isShooting) {
        this.model.anims.play('megaman-jump-up-blaster');
      } else {
        this.model.anims.play('megaman-jump-up');
      }
      return;
    }

    if (this.cursors.right.isDown) {
      this.model.flipX = false;

      if (!this.state.isDashing) {
        this.model.setVelocityX(NORMAL_VELOCITY);
      }

      this._megamanShouldDisplayWalkingAnimation();

      if (this.state.isDashing) {
        return;
      }
    }

    if (this.cursors.left.isDown) {
      this.model.flipX = true;

      if (!this.state.isDashing) {
        this.model.setVelocityX(-NORMAL_VELOCITY);
      }

      this._megamanShouldDisplayWalkingAnimation();

      if (this.state.isDashing) {
        return;
      }
    }

    if (this.model.body.velocity.y > 0 && !this._isMegamanTouchingTheGround()) {
      this.model.body.setSize(108, 140);
      this._fixOrigin();

      if (this.state.isShooting) {
        this.model.anims.play('megaman-jump-down-blaster');
      } else {
        this.model.anims.play('megaman-jump-down');
      }
      return;
    }

    if (this.model.body.velocity.y < 0 && !this._isMegamanTouchingTheGround()) {
      if (this.state.isShooting) {
        this.model.anims.play('megaman-jump-up-blaster');
      } else {
        this.model.anims.play('megaman-jump-up');
      }
    }

    if (
      this.model.body.velocity.y === 0 &&
      (this.model.body.velocity.x === 0 || this.state.isDashing) &&
      this._isMegamanTouchingTheGround()
    ) {
      this.model.setVelocityX(0);
      this.state.isDashing = false;

      if (this.state.isShooting) {
        this.model.anims.play('megaman-blaster-idle');
        return;
      }

      this.model.anims.play('megaman-idle');
      return;
    }
  }
}
