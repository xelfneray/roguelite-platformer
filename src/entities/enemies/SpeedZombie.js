// Speed Zombie - Aggressive fast enemy
class SpeedZombie extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, GameConfig.enemies.speedZombie);
        this.lungeCharge = 0;
    }

    update(player) {
        super.update(player);

        // Build up lunge charge
        const distance = Phaser.Math.Distance.Between(this.x, 0, player.x, 0);
        if (distance < 200 && distance > 100) {
            this.lungeCharge = Math.min(this.lungeCharge + 1, 60);

            if (this.lungeCharge >= 60) {
                this.performLunge(player);
            }
        } else {
            this.lungeCharge = 0;
        }
    }

    performLunge(player) {
        const direction = player.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * this.speed * 2);
        this.body.setVelocityY(-200);
        this.lungeCharge = 0;

        // Visual effect
        this.setFillStyle(0xff00ff);
        this.scene.time.delayedCall(500, () => {
            if (this.active) {
                this.setFillStyle(this.config.color);
            }
        });
    }
}
