// Manages enemy spawning, randomization, and encounters
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.enemyPool = ['archer', 'turtle', 'speedZombie', 'giantRabbit'];
        this.spawnQueue = [];
    }

    generateEncounters(levelLength) {
        // Clear previous encounters
        this.spawnQueue = [];

        // Generate random enemy placements
        const sectionCount = Math.floor(levelLength / GameConfig.level.sectionLength);

        for (let i = 0; i < sectionCount; i++) {
            if (Math.random() < GameConfig.level.enemySpawnChance) {
                const enemyType = Phaser.Utils.Array.GetRandom(this.enemyPool);
                const xPos = (i + 1) * GameConfig.level.sectionLength;

                this.spawnQueue.push({
                    type: enemyType,
                    x: xPos,
                    y: 520  // Always spawn on ground level
                });
            }
        }

        // Add mini-bosses on ground
        for (let i = 0; i < GameConfig.level.miniBossCount; i++) {
            const xPos = ((i + 1) * levelLength) / (GameConfig.level.miniBossCount + 2);
            this.spawnQueue.push({
                type: 'miniboss',
                x: xPos,
                y: 520
            });
        }

        // Add boss at end on ground
        this.spawnQueue.push({
            type: 'boss',
            x: levelLength - 200,
            y: 520
        });

        return this.spawnQueue;
    }

    spawnEnemy(type, x, y) {
        let enemy;

        switch (type) {
            case 'archer':
                enemy = new Archer(this.scene, x, y);
                break;
            case 'turtle':
                enemy = new Turtle(this.scene, x, y);
                break;
            case 'speedZombie':
                enemy = new SpeedZombie(this.scene, x, y);
                break;
            case 'giantRabbit':
                enemy = new GiantRabbit(this.scene, x, y);
                break;
            case 'miniboss':
                // Enhanced version of random enemy
                const baseType = Phaser.Utils.Array.GetRandom(['archer', 'turtle', 'speedZombie', 'giantRabbit']);
                enemy = this.spawnEnemy(baseType, x, y);
                this.makeMiniBoss(enemy);
                return enemy;
            case 'boss':
                // For now, super powerful turtle
                enemy = new Turtle(this.scene, x, y);
                this.makeBoss(enemy);
                return enemy;
        }

        this.enemies.push(enemy);
        return enemy;
    }

    makeMiniBoss(enemy) {
        enemy.maxHealth *= 3;
        enemy.health *= 3;
        enemy.damage *= 1.5;
        enemy.setSize(60, 90);
        enemy.setScale(1.5);
        enemy.isBasicEnemy = false;

        // Golden color
        enemy.setFillStyle(0xffd700);
    }

    makeBoss(enemy) {
        enemy.maxHealth *= 10;
        enemy.health *= 10;
        enemy.damage *= 2;
        enemy.setSize(100, 140);
        enemy.setScale(2.5);
        enemy.isBasicEnemy = false;

        // Red color
        enemy.setFillStyle(0xff0000);
    }

    update(player) {
        this.enemies = this.enemies.filter(enemy => enemy.active);
        this.enemies.forEach(enemy => enemy.update(player));
    }

    clearAll() {
        this.enemies.forEach(enemy => {
            if (enemy.healthBar) enemy.healthBar.destroy();
            enemy.destroy();
        });
        this.enemies = [];
    }

    randomizePool() {
        // Shuffle enemy pool for next run
        Phaser.Utils.Array.Shuffle(this.enemyPool);
    }
}
