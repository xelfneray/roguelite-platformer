// Base enemy class with health, damage, and AI framework
class BaseEnemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, config) {
        super(scene, x, y, 40, 60, config.color);

        this.scene = scene;
        this.config = config;
        this.maxHealth = config.health;
        this.health = config.health;
        this.damage = config.damage;
        this.speed = config.speed;
        this.attackRange = config.attackRange;
        this.preferredDistance = config.preferredDistance;
        this.aiType = config.aiType;
        this.isBasicEnemy = true;

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics setup
        this.body.setCollideWorldBounds(true);
        this.body.setGravityY(800);

        // AI state
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        this.aggroRange = 400;

        // Health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    update(player) {
        if (!this.active || this.health <= 0) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );

        // REMOVED: Aggro range check - enemies always move and attack
        // This keeps the game dynamic even when player is far away

        // AI behavior based on type
        switch (this.aiType) {
            case 'aggressive':
                this.aggressiveAI(player);
                break;
            case 'ranged':
                this.rangedAI(player);
                break;
            case 'defensive':
                this.defensiveAI(player);
                break;
            case 'unpredictable':
                this.unpredictableAI(player);
                break;
        }

        // Update health bar position
        this.updateHealthBar();

        // Attack if in range
        if (distanceToPlayer < this.attackRange) {
            this.tryAttack(player);
        }
    }

    aggressiveAI(player) {
        // Rush towards player
        const direction = player.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * this.speed);
    }

    rangedAI(player) {
        // Maintain preferred distance
        const distance = player.x - this.x;

        if (Math.abs(distance) < this.preferredDistance) {
            // Too close, back away
            this.body.setVelocityX(distance > 0 ? -this.speed : this.speed);
        } else if (Math.abs(distance) > this.preferredDistance + 50) {
            // Too far, move closer
            this.body.setVelocityX(distance > 0 ? this.speed : -this.speed);
        } else {
            // Perfect distance, stay still
            this.body.setVelocityX(0);
        }
    }

    defensiveAI(player) {
        // Similar to ranged but slower, maintains spacing
        const distance = player.x - this.x;
        const targetDistance = this.preferredDistance;

        if (Math.abs(distance) < targetDistance - 20) {
            this.body.setVelocityX(distance > 0 ? -this.speed * 0.7 : this.speed * 0.7);
        } else if (Math.abs(distance) > targetDistance + 20) {
            this.body.setVelocityX(distance > 0 ? this.speed * 0.7 : -this.speed * 0.7);
        } else {
            this.body.setVelocityX(0);
        }
    }

    unpredictableAI(player) {
        // Random movements and jumps
        if (Math.random() < 0.02) {
            this.body.setVelocityY(-300);
        }

        if (Math.random() < 0.05) {
            const direction = Math.random() < 0.5 ? -1 : 1;
            this.body.setVelocityX(direction * this.speed);
        }

        // Sometimes rush player
        if (Math.random() < 0.01) {
            const direction = player.x > this.x ? 1 : -1;
            this.body.setVelocityX(direction * this.speed * 1.5);
        }
    }

    tryAttack(player) {
        // REMOVED: Attack cooldown - enemies attack every frame they're in range
        // The visual effect still plays
        this.performAttack(player);
    }

    performAttack(player) {
        // Create attack visual
        const direction = player.x > this.x ? 1 : -1;
        const attackBox = this.scene.add.rectangle(
            this.x + (direction * 30),
            this.y,
            40,
            40,
            0xff0000,
            0.5
        );

        this.scene.tweens.add({
            targets: attackBox,
            alpha: 0,
            duration: 200,
            onComplete: () => attackBox.destroy()
        });

        // Damage player if in range
        if (player.takeDamage) {
            player.takeDamage(this.damage);
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash effect - bright red, more visible
        this.setFillStyle(0xff0000);
        this.scene.time.delayedCall(200, () => {
            if (this.active) {
                this.setFillStyle(this.config.color);
            }
        });

        // Damage number
        const damageText = this.scene.add.text(
            this.x,
            this.y - 30,
            `-${Math.floor(amount)}`,
            { fontSize: '16px', fill: '#ff4444', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });

        this.updateHealthBar();

        if (this.health <= 0) {
            this.die();
        }
    }

    updateHealthBar() {
        if (!this.healthBar) return;

        this.healthBar.clear();

        // Always update position to follow enemy
        // Position health bar above enemy based on its height
        const barX = this.x - 20;
        const barY = this.y - (this.height / 2) - 10; // 10 pixels above the top edge

        // Background
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(barX, barY, 40, 4);

        // Health
        const healthPercent = this.health / this.maxHealth;
        const color = healthPercent > 0.5 ? 0x00ff00 : (healthPercent > 0.25 ? 0xffff00 : 0xff0000);
        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(barX, barY, 40 * healthPercent, 4);
    }

    die() {
        // Death effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 0.5,
            duration: 300,
            onComplete: () => {
                // CRITICAL: Make sure health bar is destroyed
                if (this.healthBar) {
                    this.healthBar.clear();
                    this.healthBar.destroy();
                    this.healthBar = null;
                }
                this.destroy();
            }
        });

        // Drop coins (reduced for balance - target 200-250 per level)
        if (this.scene.upgradeManager) {
            this.scene.upgradeManager.addCoins(5); // Reduced from 30
        }

        // Coin visual
        const coinText = this.scene.add.text(
            this.x,
            this.y,
            '+5',
            { fontSize: '18px', fill: '#ffd700', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: coinText,
            y: coinText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => coinText.destroy()
        });
    }
}
