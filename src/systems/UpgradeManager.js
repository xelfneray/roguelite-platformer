// Manages upgrade state with localStorage persistence across levels
class UpgradeManager {
    constructor(scene) {
        this.scene = scene;

        // Load saved upgrades from localStorage
        const savedUpgrades = localStorage.getItem('playerUpgrades');
        if (savedUpgrades) {
            try {
                const data = JSON.parse(savedUpgrades);
                this.coins = data.coins || 0;
                this.currentUpgrades = data.currentUpgrades || {
                    weaponDamage: 0,
                    weaponLevel: 0,
                    health: 0,
                    speed: 0
                };
                this.permanentUpgrades = data.permanentUpgrades || {
                    movementUnlocks: {
                        dash: false,
                        grappling: false,
                        launch: false,
                        sprint: false
                    }
                };
            } catch (e) {
                console.error('Error loading upgrades:', e);
                this.initializeDefaults();
            }
        } else {
            this.initializeDefaults();
        }

        console.log('Loaded upgrades:', this.currentUpgrades, 'Coins:', this.coins);
    }

    initializeDefaults() {
        this.coins = 0;
        this.currentUpgrades = {
            weaponDamage: 0,
            weaponLevel: 0,
            health: 0,
            speed: 0
        };
        this.permanentUpgrades = {
            movementUnlocks: {
                dash: false,
                grappling: false,
                launch: false,
                sprint: false
            }
        };
    }

    saveToLocalStorage() {
        const data = {
            coins: this.coins,
            currentUpgrades: this.currentUpgrades,
            permanentUpgrades: this.permanentUpgrades
        };
        localStorage.setItem('playerUpgrades', JSON.stringify(data));
        console.log('Saved upgrades:', data);
    }

    addCoins(amount) {
        this.coins += amount;
        this.scene.events.emit('coinsChanged', this.coins);
        this.saveToLocalStorage();
    }

    purchaseUpgrade(type) {
        const cost = GameConfig.upgrades.costs[type]; // Flat cost

        if (cost && this.coins >= cost) {
            this.coins -= cost;
            this.currentUpgrades[type]++;
            this.scene.events.emit('upgradeChanged', type, this.currentUpgrades[type]);
            this.scene.events.emit('coinsChanged', this.coins);
            this.saveToLocalStorage();
            console.log(`Purchased ${type} for ${cost} coins`);
            return true;
        }
        console.log(`Cannot purchase ${type} - need ${cost}, have ${this.coins}`);
        return false;
    }

    applyDeathDecay() {
        // Apply 50% decay to non-permanent upgrades
        const decayRate = GameConfig.upgrades.decayRate;

        this.currentUpgrades.weaponDamage = Math.floor(this.currentUpgrades.weaponDamage * decayRate);
        this.currentUpgrades.weaponLevel = Math.floor(this.currentUpgrades.weaponLevel * decayRate);
        this.currentUpgrades.health = Math.floor(this.currentUpgrades.health * decayRate);
        this.currentUpgrades.speed = Math.floor(this.currentUpgrades.speed * decayRate);

        // Movement unlocks are permanent, don't decay
    }

    unlockMovement(type) {
        if (this.permanentUpgrades.movementUnlocks.hasOwnProperty(type)) {
            this.permanentUpgrades.movementUnlocks[type] = true;
            this.scene.events.emit('movementUnlocked', type);
        }
    }

    getUpgradeLevel(type) {
        return this.currentUpgrades[type] || 0;
    }

    hasMovementUnlock(type) {
        return this.permanentUpgrades.movementUnlocks[type] || false;
    }

    reset() {
        this.applyDeathDecay();
    }
}
