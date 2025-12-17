// Giant Rabbit - High mobility, unpredictable enemy
class GiantRabbit extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, GameConfig.enemies.giantRabbit);
        this.jumpTimer = 0;
    }

    update(player) {
        super.update(player);

        // Much less frequent jumping to stay on ground
        this.jumpTimer++;
        if (this.jumpTimer > 240 && this.body.onFloor()) { // Reduced frequency even more (4 seconds)
            this.performJump();
            this.jumpTimer = 0;
        }
    }

    performJump() {
        const randomAngle = Phaser.Math.Between(-45, 45);
        const jumpForce = Phaser.Math.Between(150, 250); // Much weaker jumps

        this.body.setVelocityY(-jumpForce);

        // Random horizontal movement
        const horizontalForce = Math.sin(randomAngle * Math.PI / 180) * 200;
        this.body.setVelocityX(horizontalForce);
    }

    performAttack(player) {
        // Stomp attack when landing
        super.performAttack(player);

        // Create shockwave effect
        const shockwave = this.scene.add.circle(this.x, this.y + 30, 10, 0xffb6c1, 0.6);

        this.scene.tweens.add({
            targets: shockwave,
            radius: 60,
            alpha: 0,
            duration: 400,
            onComplete: () => shockwave.destroy()
        });
    }
}
