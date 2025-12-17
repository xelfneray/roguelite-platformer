// Manages weapon inventory and switching
class WeaponManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.weapons = {
            sword: new Sword(scene, player)
        };
        this.currentWeapon = 'sword';
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeapon];
    }

    attack(targetX, targetY) {
        return this.getCurrentWeapon().attack(targetX, targetY);
    }

    switchWeapon(weaponName) {
        if (this.weapons[weaponName]) {
            this.currentWeapon = weaponName;
            this.scene.events.emit('weaponSwitched', weaponName);
        }
    }

    upgradeCurrentWeapon() {
        this.getCurrentWeapon().levelUp();
    }

    destroy() {
        Object.values(this.weapons).forEach(weapon => weapon.destroy());
    }
}
