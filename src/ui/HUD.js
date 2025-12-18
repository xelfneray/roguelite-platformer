// HUD displaying health, coins, weapon info
class HUD {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0).setDepth(100); // Follow camera!

        // Text elements
        this.healthText = scene.add.text(20, 20, '', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(100);

        this.coinsText = scene.add.text(20, 50, '', {
            fontSize: '18px',
            fill: '#ffd700',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(100);

        this.weaponText = scene.add.text(20, 80, '', {
            fontSize: '16px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(100);

        // Listen to events
        scene.events.on('playerHealthChanged', this.updateHealth, this);
        scene.events.on('coinsChanged', this.updateCoins, this);
        scene.events.on('weaponSwitched', this.updateWeapon, this);

        this.coins = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.currentWeapon = 'Sword Lv.0';

        this.update();
    }

    updateHealth(health, maxHealth) {
        this.health = health;
        this.maxHealth = maxHealth;
        this.update();
    }

    updateCoins(coins) {
        this.coins = coins;
        this.update();
    }

    updateWeapon(weaponName) {
        this.currentWeapon = weaponName;
        this.update();
    }

    update() {
        // Safety checks to prevent null crashes
        const safeHealth = Math.max(0, Math.floor(this.health || 0));
        const safeMaxHealth = this.maxHealth || 100;
        const safeCoins = this.coins || 0;
        const safeWeapon = this.currentWeapon || 'Sword Lv.0';

        if (this.healthText && this.healthText.active) {
            this.healthText.setText(`HP: ${safeHealth}/${safeMaxHealth}`);
        }
        if (this.coinsText && this.coinsText.active) {
            this.coinsText.setText(`Coins: ${safeCoins}`);
        }
        if (this.weaponText && this.weaponText.active) {
            this.weaponText.setText(`Weapon: ${safeWeapon}`);
        }

        // Health bar with improved color coding
        this.graphics.clear();

        // Background
        this.graphics.fillStyle(0x000000, 0.5);
        this.graphics.fillRect(20, 110, 200, 20);

        // Health - color-coded: green 66-100%, yellow 41-65%, red 0-40%
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        let barColor;
        if (healthPercent > 0.65) {
            barColor = 0x00ff00; // Green
        } else if (healthPercent > 0.40) {
            barColor = 0xffff00; // Yellow
        } else {
            barColor = 0xff0000; // Red
        }
        this.graphics.fillStyle(barColor);
        this.graphics.fillRect(20, 110, 200 * healthPercent, 20);
    }

    destroy() {
        this.healthText.destroy();
        this.coinsText.destroy();
        this.weaponText.destroy();
        this.graphics.destroy();
    }
}
