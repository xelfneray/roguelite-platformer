// Player character with movement, combat, and upgrades
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // Create player sprite (idle frame)
        super(scene, x, y, 'player-idle');

        this.scene = scene;
        this.maxHealth = GameConfig.player.baseHealth;
        this.health = this.maxHealth;
        this.isDead = false;
        this.isDashing = false;

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set sprite properties
        this.setScale(0.725); // 45% larger than before
        this.setOrigin(0.5, 0.5);

        // Physics setup - adjust hitbox to match sprite
        this.body.setSize(60, 90); // Similar to old rectangle size
        this.body.setOffset(34, 19); // Center hitbox on sprite
        this.body.setCollideWorldBounds(true);
        this.body.setGravityY(800);
        this.body.setMaxVelocity(300, 600);

        // Movement
        this.speed = GameConfig.player.baseSpeed;
        this.jumpForce = GameConfig.player.jumpForce;
        this.lastDashTime = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        // Combat
        this.lastAttackTime = 0;
        this.isInvulnerable = false;

        // Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = {
            attack: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            dash: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            parry: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
            upgrade: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U)
        };

        // Systems
        this.weaponManager = new WeaponManager(scene, this);
        this.parrySystem = new ParrySystem(scene, this);

        // Touch controls reference (set by scene on mobile)
        this.touchControls = null;

        // Visual sword - using pixel art sprite (first frame of slash)
        this.sword = scene.add.sprite(0, 0, 'sword-slash', 0);
        this.sword.setOrigin(0, 0.5);
        this.sword.setScale(2);
        this.sword.setVisible(false); // Hidden by default - only show during attack
        this.swordAngle = 0;
        this.isAttacking = false;
    }

    update() {
        if (this.isDead) return;

        // Update sword position and rotation
        const swordDistance = 25;
        const direction = this.flipX ? -1 : 1;
        this.sword.x = this.x + (direction * swordDistance);
        this.sword.y = this.y;
        this.sword.setScale(direction, 1);

        if (this.isAttacking) {
            // Horizontal swing animation (toward/away from screen)
            this.swordAngle += 20;
            if (this.swordAngle >= 120) {
                this.swordAngle = 0;
                this.isAttacking = false;
            }
            // Rotate on Z-axis for horizontal swing
            this.sword.setRotation(Phaser.Math.DegToRad(this.swordAngle));
        } else {
            this.sword.setRotation(0);
        }

        // Check for touch controls
        const tc = this.touchControls;
        const hasTouch = tc && tc.isEnabled;

        // Horizontal movement + animation
        const leftDown = this.cursors.left.isDown || (hasTouch && tc.isDown('left'));
        const rightDown = this.cursors.right.isDown || (hasTouch && tc.isDown('right'));

        if (leftDown) {
            this.body.setVelocityX(-this.speed);
            this.flipX = true;
            // Play run animation only if NOT attacking
            if (!this.isAttacking && (!this.anims.isPlaying || this.anims.currentAnim.key !== 'player-run-anim')) {
                this.play('player-run-anim', true);
            }
        } else if (rightDown) {
            this.body.setVelocityX(this.speed);
            this.flipX = false;
            // Play run animation only if NOT attacking
            if (!this.isAttacking && (!this.anims.isPlaying || this.anims.currentAnim.key !== 'player-run-anim')) {
                this.play('player-run-anim', true);
            }
        } else {
            this.body.setVelocityX(0);
            // Play idle animation when not moving and NOT attacking
            if (!this.isAttacking && (!this.anims.isPlaying || this.anims.currentAnim.key !== 'player-idle-anim')) {
                this.play('player-idle-anim', true);
            }
        }

        // Jump - more responsive, can jump immediately on landing
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || (hasTouch && tc.justPressed('jump'));
        if (jumpPressed) {
            if (this.body.onFloor() || this.body.touching.down) {
                this.body.setVelocityY(this.jumpForce);
                this.hasDoubleJumped = false;
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                this.body.setVelocityY(this.jumpForce * 0.8);
                this.hasDoubleJumped = true;
            }
        }

        // Dash
        const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash) || (hasTouch && tc.justPressed('dash'));
        if (dashPressed) {
            this.performDash();
        }

        // Attack - only trigger animation if weapon actually attacked
        const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.attack) || (hasTouch && tc.justPressed('attack'));
        if (attackPressed && !this.isAttacking) {
            // For touch, attack in the direction the player is facing
            const attackX = this.flipX ? this.x - 100 : this.x + 100;
            const attackY = this.y;
            const didAttack = this.weaponManager.attack(attackX, attackY);

            if (didAttack) {
                this.isAttacking = true;

                // Check if player is moving
                const isMoving = Math.abs(this.body.velocity.x) > 10;

                // Stop current animation and play attack animation
                this.anims.stop();

                if (isMoving) {
                    // Play run-attack animation while moving
                    this.play('run-attack-anim', true);
                } else {
                    // For standing attack, use attacking.png animation
                    this.play('stand-attack-anim', true);
                }

                // Use timer to reset isAttacking after animation duration (500ms = 8 frames at 16fps)
                this.scene.time.delayedCall(500, () => {
                    this.isAttacking = false;
                });
            }
        }

        // Parry
        const parryPressed = Phaser.Input.Keyboard.JustDown(this.keys.parry) || (hasTouch && tc.justPressed('parry'));
        if (parryPressed) {
            this.parrySystem.attemptParry();
        }
    }

    performDash() {
        const now = Date.now();
        if (now - this.lastDashTime < GameConfig.player.dashCooldown) {
            return;
        }

        this.isDashing = true;
        this.lastDashTime = now;

        const direction = this.flipX ? -1 : 1;
        this.body.setVelocityX(direction * GameConfig.player.dashSpeed);

        // Visual effect
        const dashTrail = this.scene.add.rectangle(
            this.x, this.y,
            this.width, this.height,
            GameConfig.colors.player,
            0.3
        );

        this.scene.tweens.add({
            targets: dashTrail,
            alpha: 0,
            duration: GameConfig.player.dashDuration,
            onComplete: () => dashTrail.destroy()
        });

        // Make invulnerable during dash
        this.isInvulnerable = true;

        this.scene.time.delayedCall(GameConfig.player.dashDuration, () => {
            this.isDashing = false;
            this.isInvulnerable = false;
        });
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.isDead) return;

        // Check for parry
        const parryResult = this.parrySystem.checkParry(amount);
        if (parryResult.parried) {
            // Reflect damage back (handled by enemy system)
            this.scene.events.emit('parrySuccess', parryResult.counterDamage);
            return;
        }

        this.health -= amount;

        // Flash effect (tint for sprites)
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) {
                this.clearTint();
            }
        });

        // Damage number
        const damageText = this.scene.add.text(
            this.x - 20,
            this.y - 50,
            `-${Math.floor(amount)}`,
            { fontSize: '20px', fill: '#ff0000', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => damageText.destroy()
        });

        // Brief invulnerability
        this.isInvulnerable = true;
        this.scene.time.delayedCall(500, () => {
            this.isInvulnerable = false;
        });

        this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);

        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);

        const healText = this.scene.add.text(
            this.x - 20,
            this.y - 50,
            `+${Math.floor(amount)}`,
            { fontSize: '20px', fill: '#00ff00', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: healText,
            y: healText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => healText.destroy()
        });

        this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
    }

    die() {
        this.isDead = true;

        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            angle: 360,
            duration: 1000,
            onComplete: () => {
                this.scene.events.emit('playerDied');
            }
        });
    }

    respawn() {
        this.health = this.maxHealth;
        this.isDead = false;
        this.alpha = 1;
        this.angle = 0;
        this.x = 100;
        this.y = 300;
        this.body.setVelocity(0, 0);
    }

    upgradeWeapon() {
        this.weaponManager.upgradeCurrentWeapon();

        // Emit event to update HUD
        const weapon = this.weaponManager.getCurrentWeapon();
        this.scene.events.emit('weaponSwitched', `Sword Lv.${weapon.level}`);
    }

    unlockMovement(type) {
        switch (type) {
            case 'doubleJump':
                this.canDoubleJump = true;
                break;
        }
    }

    destroy() {
        this.weaponManager.destroy();
        if (this.sword) this.sword.destroy();
        super.destroy();
    }
}
