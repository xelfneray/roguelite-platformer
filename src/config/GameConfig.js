// Central game configuration and balance parameters
const GameConfig = {
    // Weapon configurations
    weapons: {
        sword: {
            name: 'Sword',
            levels: [
                { damage: 20, range: 80, cooldown: 2000, abilities: [] },
                { damage: 30, range: 95, cooldown: 1800, abilities: ['increased_range'] },
                { damage: 45, range: 110, cooldown: 1600, abilities: ['dash_attack'] },
                { damage: 60, range: 130, cooldown: 1400, abilities: ['throwable'] },
                { damage: 80, range: 160, cooldown: 1200, abilities: ['magic_slash', 'one_shot_basic'] }
            ]
        },
        bow: {
            name: 'Bow',
            levels: [
                { damage: 4, range: 200, cooldown: 700, abilities: [] },
                { damage: 6, range: 220, cooldown: 650, abilities: ['faster_arrows'] },
                { damage: 9, range: 240, cooldown: 600, abilities: ['double_shot'] },
                { damage: 13, range: 260, cooldown: 550, abilities: ['homing'] },
                { damage: 18, range: 300, cooldown: 500, abilities: ['elemental', 'triple_shot'] }
            ]
        },
        staff: {
            name: 'Staff',
            levels: [
                { damage: 5, range: 150, cooldown: 800, abilities: [] },
                { damage: 7, range: 160, cooldown: 750, abilities: ['faster_projectile'] },
                { damage: 10, range: 180, cooldown: 700, abilities: ['piercing'] },
                { damage: 14, range: 200, cooldown: 650, abilities: ['area_damage'] },
                { damage: 19, range: 250, cooldown: 600, abilities: ['crowd_control', 'buff_aura'] }
            ]
        }
    },

    // Enemy configurations
    enemies: {
        archer: {
            name: 'Archer',
            health: 15,
            damage: 2,
            speed: 80,
            attackRange: 200,
            preferredDistance: 180,
            color: 0x8B4513,
            aiType: 'ranged'
        },
        turtle: {
            name: 'Turtle',
            health: 30,
            damage: 4,
            speed: 40,
            attackRange: 60,
            preferredDistance: 100,
            color: 0x2F4F2F,
            aiType: 'defensive'
        },
        speedZombie: {
            name: 'Speed Zombie',
            health: 12,
            damage: 3,
            speed: 120, // Reduced from 150 to make it catchable
            attackRange: 40,
            preferredDistance: 0,
            color: 0x800080,
            aiType: 'aggressive'
        },
        giantRabbit: {
            name: 'Giant Rabbit',
            health: 20,
            damage: 5,
            speed: 120,
            attackRange: 50,
            preferredDistance: 80,
            color: 0xFFB6C1,
            aiType: 'unpredictable'
        }
    },

    // Upgrade system
    upgrades: {
        decayRate: 0.5, // 50% retention on death
        costs: {
            weaponDamage: [100, 200, 400, 800],
            weaponLevel: [150, 300, 600, 1200],
            health: [80, 160, 320, 640],
            speed: [120, 240, 480, 960]
        }
    },

    // Player configuration
    player: {
        baseHealth: 100,
        baseSpeed: 150,
        jumpForce: -600, // Increased from -500 for even higher jumps
        dashSpeed: 300,
        dashDuration: 200,
        dashCooldown: 1000,
        grapplingRange: 300,
        parryWindow: 150, // ms
        parryReward: 2.0 // damage multiplier
    },

    // Upgrade costs
    upgrades: {
        costs: {
            weaponLevel: 150,
            weaponDamage: 100,
            health: 80,
            speed: 120
        },
        decayRate: 0.5
    },

    // Level configuration
    level: {
        miniBossCount: 5,
        bossCount: 1,
        sectionLength: 400,
        platformHeight: [100, 200, 300],
        enemySpawnChance: 0.6
    },

    // Visual settings
    colors: {
        player: 0x00ff88,
        background: 0x0f0f1e,
        platform: 0x2a2a3e,
        ui: 0x4a4a5e,
        damage: 0xff4444,
        heal: 0x44ff44,
        coin: 0xffd700
    }
};
