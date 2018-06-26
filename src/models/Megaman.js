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
      dash: {
        isActive: false,
        isReleased: false,
      },
      isInitialized: false,
      blaster: {
        isActive: false,
        isReleased: true,
      },
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

    this.charger = this.scene.add.sprite(
      0,
      0,
      'megaman',
      'megaman-charge/charge-1.png',
    );

    this.generateAnimations();
    this.generateControls();

    this.charger.setActive(false);
    this.charger.setVisible(false);

    this.model.setScale(0.7);
    this.model.body.setSize(74, 160);
    this.model.setOrigin(0.5, 0.61);

    this.model.setCollideWorldBounds(true);
    this.model.body.setGravityY(900);
  }

  generateAnimations() {
    const { anims } = this.scene;

    anims.create({
      key: 'megaman-init',
      frames: [
        ...anims.generateFrameNames('megaman', {
          prefix: 'megaman-init/megaman-init-',
          suffix: '.png',
          start: 1,
          end: 5,
        }),
        { key: 'megaman', frame: 'megaman-walk/megaman-idle.png' },
      ],
      frameRate: 15,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-walk',
      frames: anims.generateFrameNames('megaman', {
        prefix: 'megaman-walk/megaman-walk-',
        suffix: '.png',
        start: 1,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: 'megaman-idle',
      frames: [{ key: 'megaman', frame: 'megaman-walk/megaman-idle.png' }],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-jump-up',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-up.png' }],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-jump-up-blaster',
      frames: [
        { key: 'megaman', frame: 'megaman-jump/megaman-jump-up-shooting.png' },
      ],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-jump-down',
      frames: [{ key: 'megaman', frame: 'megaman-jump/megaman-jump-down.png' }],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-jump-down-blaster',
      frames: [
        {
          key: 'megaman',
          frame: 'megaman-jump/megaman-jump-down-shooting.png',
        },
      ],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-dash',
      frames: [{ key: 'megaman', frame: 'megaman-dash/megaman-dash.png' }],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-blaster-idle',
      frames: [
        { key: 'megaman', frame: 'megaman-shooting/megaman-shooting-idle.png' },
      ],
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-walk-blaster',
      frames: anims.generateFrameNames('megaman', {
        prefix: 'megaman-shooting/megaman-shooting-',
        suffix: '.png',
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: 0,
    });

    anims.create({
      key: 'megaman-charge',
      frames: anims.generateFrameNames('megaman', {
        prefix: 'megaman-charge/charge-',
        suffix: '.png',
        start: 1,
        end: 10,
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
    this.dashButton = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X,
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
      if (dashRight.matched || dashLeft.matched) {
        this._setDashingState();
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
    const { blaster } = this.state;

    if (blaster.isReleased) {
      blaster.isReleased = false;
      blaster.isActive = true;

      if (this.counters.shooting) {
        clearTimeout(this.counters.shooting);
      }

      this.counters.shooting = setTimeout(() => {
        blaster.isActive = false;
      }, 300);

      return true;
    }

    return false;
  }

  _setDashingState() {
    const { dash } = this.state;

    if (this._isMegamanTouchingTheGround() && dash.isReleased) {
      dash.isReleased = false;
      dash.isActive = true;

      this.counters.dash = setTimeout(() => {
        if (this._isMegamanTouchingTheGround()) {
          dash.isActive = false;
        }

        this.counters.dash = null;
      }, 300);

      this.model.anims.play('megaman-dash');

      return true;
    }

    return false;
  }

  _megamanShouldDisplayWalkingAnimation() {
    const { blaster, dash } = this.state;

    if (this._isMegamanTouchingTheGround() && !dash.isActive) {
      if (!blaster.isActive) {
        this.model.anims.play('megaman-walk', true);
      } else {
        this.model.anims.play('megaman-walk-blaster', true);
      }

      return true;
    }

    return false;
  }

  update() {
    const { blaster, dash } = this.state;

    if (this._isMegamanTouchingTheGround() && !this.state.firstTouchTheGround) {
      this.state.firstTouchTheGround = true;
      this.model.anims.play('megaman-init');
      return;
    }

    if (!this.state.firstTouchTheGround || !this.state.isInitialized) {
      return;
    }

    if (dash.isActive) {
      let dashVelocity = this.model.flipX ? -DASH_VELOCITY : DASH_VELOCITY;
      this.model.setVelocityX(dashVelocity);

      if (!this.counters.dash && this._isMegamanTouchingTheGround()) {
        dash.isActive = false;
      }
    } else {
      this.model.setVelocityX(0);
    }

    if (this.blasterButton.isDown) {
      // this.charger.setActive(true);
      // this.charger.setVisible(true);
      // this.charger.setPosition(this.model.x, this.model.y);
      // this.charger.anims.play('megaman-charge');

      this._setShootingState();
    } else {
      blaster.isReleased = true;
    }

    if (this.dashButton.isDown) {
      this._setDashingState();
    } else {
      dash.isReleased = true;
    }

    if (
      (this.cursors.up.isDown || this.jumpButton.isDown) &&
      this._isMegamanTouchingTheGround()
    ) {
      this.model.body.setSize(74, 184);
      this._fixOrigin();
      this.model.setVelocityY(-JUMP_VELOCITY);

      if (blaster.isActive) {
        this.model.anims.play('megaman-jump-up-blaster');
      } else {
        this.model.anims.play('megaman-jump-up');
      }
      return;
    }

    if (this.cursors.right.isDown) {
      this.model.flipX = false;

      if (!dash.isActive) {
        this.model.setVelocityX(NORMAL_VELOCITY);
      }

      this._megamanShouldDisplayWalkingAnimation();

      if (dash.isActive) {
        return;
      }
    }

    if (this.cursors.left.isDown) {
      this.model.flipX = true;

      if (!dash.isActive) {
        this.model.setVelocityX(-NORMAL_VELOCITY);
      }

      this._megamanShouldDisplayWalkingAnimation();

      if (dash.isActive) {
        return;
      }
    }

    if (this.model.body.velocity.y > 0 && !this._isMegamanTouchingTheGround()) {
      this.model.body.setSize(108, 140);
      this._fixOrigin();

      if (blaster.isActive) {
        this.model.anims.play('megaman-jump-down-blaster');
      } else {
        this.model.anims.play('megaman-jump-down');
      }
      return;
    }

    if (this.model.body.velocity.y < 0 && !this._isMegamanTouchingTheGround()) {
      if (blaster.isActive) {
        this.model.anims.play('megaman-jump-up-blaster');
      } else {
        this.model.anims.play('megaman-jump-up');
      }
    }

    if (
      this.model.body.velocity.y === 0 &&
      (this.model.body.velocity.x === 0 || dash.isActive) &&
      this._isMegamanTouchingTheGround()
    ) {
      this.model.setVelocityX(0);
      dash.isActive = false;

      if (this.state.blaster.isActive) {
        this.model.anims.play('megaman-blaster-idle');
        return;
      }

      this.model.anims.play('megaman-idle');
      return;
    }
  }
}
