// Turtle - Defensive enemy with spacing mechanics
class Turtle extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, GameConfig.enemies.turtle);
        this.isDefending = false;
    }

    update(player) {
        super.update(player);

        // Randomly enter defense mode
        if (Math.random() < 0.01 && !this.isDefending) {
            this.enterDefenseMode();
        }
    }

    enterDefenseMode() {
        this.isDefending = true;
        this.setFillStyle(0x1a3a1a); // Darker green
        this.body.setVelocityX(0);

        // Exit after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (this.active) {
                this.isDefending = false;
                this.setFillStyle(this.config.color);
            }
        });
    }

    takeDamage(amount) {
        // Reduced damage when defending
        if (this.isDefending) {
            amount *= 0.3;
        }
        super.takeDamage(amount);
    }
}
