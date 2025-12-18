// Sword weapon with 5 evolution levels (0-4)
class Sword {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.level = 0;
        this.lastAttackTime = 0;
        this.graphics = scene.add.graphics();

        // Cooldown indicator
        this.cooldownText = null;
    }

    get stats() {
        return GameConfig.weapons.sword.levels[this.level];
    }

    attack(targetX, targetY) {
        // REMOVED: Cooldown check - sword attacks instantly every time
        // Only visual effect remains

        this.lastAttackTime = Date.now(); // Track for potential future use

        // Create sword slash arc effect (Minecraft style)
        this.createSlashEffect();

        // Determine attack direction
        const direction = this.player.flipX ? -1 : 1;

        switch (this.level) {
            case 0:
            case 1:
                this.basicSlash(direction);
                break;
            case 2:
                if (this.player.isDashing) {
                    this.dashAttack(direction);
                } else {
                    this.basicSlash(direction);
                }
                break;
            case 3:
                // Can throw or slash
                if (Phaser.Math.Distance.Between(this.player.x, 0, targetX, 0) > 100) {
                    this.throwSword(targetX, targetY);
                } else {
                    this.basicSlash(direction);
                }
                break;
            case 4:
                // Level 4: basicSlash for immediate damage + magicSlash for extra range
                this.basicSlash(direction);
                this.magicSlash(direction);
                break;
        }

        return true;
    }

    basicSlash(direction) {
        // Check if we'll hit any enemy first
        const potentialHitBox = new Phaser.Geom.Rectangle(
            this.player.x + (direction * this.stats.range) - (this.stats.range / 2),
            this.player.y - 30,
            this.stats.range,
            60
        );

        let willHit = false;
        if (this.scene.enemyManager) {
            this.scene.enemyManager.enemies.forEach(enemy => {
                if (!enemy.active) return;
                const enemyBounds = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(potentialHitBox, enemyBounds)) {
                    willHit = true;
                }
            });
        }

        // REMOVED: Visual hitbox - no more white rectangle
        // Only check for hits, don't show visual

        // Damage enemies in range with knockback
        this.checkHitWithKnockback(potentialHitBox, direction);
    }

    dashAttack(direction) {
        const hitBox = this.scene.add.rectangle(
            this.player.x + (direction * this.stats.range * 1.5),
            this.player.y,
            this.stats.range * 1.5,
            80,
            0xff8844,
            0.6
        );

        this.scene.tweens.add({
            targets: hitBox,
            alpha: 0,
            scaleX: 1.2,
            duration: 250,
            onComplete: () => hitBox.destroy()
        });

        this.checkHit(hitBox, 1.5); // 1.5x damage on dash attack
    }

    throwSword(targetX, targetY) {
        // Auto-target nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;

        if (this.scene.enemyManager) {
            this.scene.enemyManager.enemies.forEach(enemy => {
                if (enemy.active && enemy.health > 0) {
                    const dist = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        enemy.x, enemy.y
                    );
                    if (dist < nearestDistance) {
                        nearestDistance = dist;
                        nearestEnemy = enemy;
                    }
                }
            });
        }

        // Target nearest enemy, or throw forward if none
        if (nearestEnemy) {
            targetX = nearestEnemy.x;
            targetY = nearestEnemy.y;
        } else {
            targetX = this.player.x + (this.player.flipX ? -300 : 300);
            targetY = this.player.y;
        }

        const projectile = this.scene.add.rectangle(
            this.player.x,
            this.player.y,
            30,
            10,
            0xffff44
        );

        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            targetX, targetY
        );

        this.scene.physics.add.existing(projectile);
        projectile.body.setVelocity(
            Math.cos(angle) * 400,
            Math.sin(angle) * 400
        );

        this.scene.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });

        const hitTimer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (!projectile.active) {
                    hitTimer.remove();
                    return;
                }
                this.checkHit(projectile, 1.2);
            },
            loop: true
        });
    }

    magicSlash(direction) {
        // Large magic wave
        const wave = this.scene.add.rectangle(
            this.player.x,
            this.player.y,
            this.stats.range * 2,
            100,
            0x88ffff,
            0.7
        );

        this.scene.physics.add.existing(wave);
        wave.body.setVelocityX(direction * 300);

        // Expand and fade
        this.scene.tweens.add({
            targets: wave,
            scaleY: 1.5,
            alpha: 0,
            duration: 800,
            onComplete: () => wave.destroy()
        });

        // Continuous damage check
        const hitTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (!wave.active) {
                    hitTimer.remove();
                    return;
                }
                this.checkHit(wave, 2.0);
            },
            loop: true
        });
    }

    checkHit(hitBox, damageMultiplier = 1.0) {
        if (!this.scene.enemyManager) return;

        const enemies = this.scene.enemyManager.enemies;
        const bounds = hitBox.getBounds ? hitBox.getBounds() : hitBox;

        enemies.forEach(enemy => {
            if (!enemy.active) return;

            const enemyBounds = enemy.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, enemyBounds)) {
                let damage = this.stats.damage * damageMultiplier;

                // Level 4: one-shot basic enemies
                if (this.level === 4 && enemy.isBasicEnemy) {
                    damage = enemy.health;
                }

                enemy.takeDamage(damage);
            }
        });
    }

    checkHitWithKnockback(hitBox, direction) {
        if (!this.scene.enemyManager) return;

        const enemies = this.scene.enemyManager.enemies;
        const bounds = hitBox;

        enemies.forEach(enemy => {
            if (!enemy.active) return;

            const enemyBounds = enemy.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, enemyBounds)) {
                let damage = this.stats.damage;

                // Level 4: one-shot basic enemies
                if (this.level === 4 && enemy.isBasicEnemy) {
                    damage = enemy.health;
                }

                enemy.takeDamage(damage);

                // Knockback effect
                if (enemy.body) {
                    enemy.body.setVelocityX(direction * 250);
                    enemy.body.setVelocityY(-100);
                }
            }
        });
    }

    levelUp() {
        if (this.level < 4) {
            this.level++;
            this.showLevelUpEffect();

            // Emit event to update HUD
            this.scene.events.emit('weaponSwitched', `Sword Lv.${this.level}`);
        }
    }

    showLevelUpEffect() {
        const text = this.scene.add.text(
            this.player.x,
            this.player.y - 50,
            `SWORD LV ${this.level}!`,
            { fontSize: '20px', fill: '#ffff00', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy()
        });
    }

    createSlashEffect() {
        // Removed - now using player attack sprites instead
    }

    showCooldownIndicator(remainingMs) {
        // Remove existing indicator
        if (this.cooldownText) {
            this.cooldownText.destroy();
        }

        const seconds = (remainingMs / 1000).toFixed(1);
        this.cooldownText = this.scene.add.text(
            this.player.x,
            this.player.y - 70,
            `${seconds}s`,
            { fontSize: '16px', fill: '#ff8888', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: this.cooldownText,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                if (this.cooldownText) {
                    this.cooldownText.destroy();
                    this.cooldownText = null;
                }
            }
        });
    }

    destroy() {
        this.graphics.destroy();
    }
}
