// Experimental parry system
class ParrySystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.isParrying = false;
        this.parryWindow = GameConfig.player.parryWindow;
        this.parryCooldown = 800;
        this.lastParryTime = 0;
    }

    attemptParry() {
        const now = Date.now();
        if (now - this.lastParryTime < this.parryCooldown) {
            return false;
        }

        this.isParrying = true;
        this.lastParryTime = now;

        // Visual indicator
        const parryCircle = this.scene.add.circle(
            this.player.x,
            this.player.y,
            50,
            0x00ffff,
            0.3
        );

        this.scene.tweens.add({
            targets: parryCircle,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: this.parryWindow,
            onComplete: () => parryCircle.destroy()
        });

        // End parry window
        this.scene.time.delayedCall(this.parryWindow, () => {
            this.isParrying = false;
        });

        return true;
    }

    checkParry(incomingDamage) {
        if (this.isParrying) {
            // Successful parry!
            this.showParrySuccess();
            return {
                parried: true,
                counterDamage: incomingDamage * GameConfig.player.parryReward
            };
        }
        return { parried: false };
    }

    showParrySuccess() {
        const text = this.scene.add.text(
            this.player.x,
            this.player.y - 60,
            'PARRY!',
            { fontSize: '24px', fill: '#00ffff', fontStyle: 'bold' }
        );

        this.scene.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }
}
