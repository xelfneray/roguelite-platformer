// Main gameplay scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create(data) {
        // Get level number from hub (default to 1)
        this.currentLevel = data?.level || 1;
        // Set world bounds
        this.levelLength = 3000;
        this.physics.world.setBounds(0, 0, this.levelLength, 600);

        // Background
        this.cameras.main.setBackgroundColor(GameConfig.colors.background);

        // Create platforms
        this.createPlatforms();

        // Initialize systems
        this.upgradeManager = new UpgradeManager(this);
        this.enemyManager = new EnemyManager(this);

        // Create player
        this.player = new Player(this, 100, 300);

        // Create touch controls for mobile
        this.touchControls = new TouchControls(this);
        this.player.touchControls = this.touchControls;

        // Apply saved upgrades to player
        this.applyLoadedUpgrades();

        // Create HUD
        this.hud = new HUD(this);

        // Update HUD with initial values immediately
        this.events.emit('coinsChanged', this.upgradeManager.coins);
        this.events.emit('playerHealthChanged', this.player.health, this.player.maxHealth);

        // Health packs array
        this.healthPacks = [];

        // Generate level
        this.generateLevel();

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.levelLength, 600);

        // Zoom out on mobile for better view
        if (this.touchControls && this.touchControls.isEnabled) {
            this.cameras.main.setZoom(1);
        }

        // Listen to events
        this.events.on('playerDied', this.onPlayerDeath, this);
        this.events.on('toggleUpgradeMenu', this.toggleUpgradeMenu, this);

        // Upgrade menu (hidden by default)
        this.upgradeMenuActive = false;
        this.createUpgradeMenu();

        // Tutorial text (only show on desktop)
        if (!this.touchControls.isEnabled) {
            this.showTutorial();
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // Ground
        const ground = this.add.rectangle(
            this.levelLength / 2,
            580,
            this.levelLength,
            40,
            GameConfig.colors.platform
        );
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Add some platforms for parkour
        for (let x = 200; x < this.levelLength; x += 400) {
            const height = Phaser.Utils.Array.GetRandom(GameConfig.level.platformHeight);
            const platform = this.add.rectangle(
                x + Phaser.Math.Between(-50, 50),
                500 - height,
                150,
                20,
                GameConfig.colors.platform
            );
            this.physics.add.existing(platform, true);
            this.platforms.add(platform);
        }
    }

    generateLevel() {
        // Generate enemy encounters
        this.enemyManager.generateEncounters(this.levelLength);

        // Spawn enemies (ensure minimum distance from player start)
        this.enemyManager.spawnQueue.forEach(spawn => {
            // Make sure enemies spawn at least 720 pixels (screen width + buffer) from player start
            if (spawn.x > 720) {
                this.enemyManager.spawnEnemy(spawn.type, spawn.x, spawn.y);
            }
        });

        // Spawn health packs randomly
        this.spawnHealthPacks();

        // Add level end marker (carpet)
        this.createFinishLine();

    }

    spawnHealthPacks() {
        // Spawn 5-8 health packs throughout the level
        const packCount = Phaser.Math.Between(1, 3);

        for (let i = 0; i < packCount; i++) {
            const x = Phaser.Math.Between(800, this.levelLength - 300);
            const y = 500;

            // Create health pack visual (just rectangle, no text)
            const pack = this.add.rectangle(x, y, 25, 25, 0xff0066);

            this.physics.add.existing(pack, true);
            this.healthPacks.push(pack);
        }
    }

    createFinishLine() {
        // Create flag finish line
        const flagX = this.levelLength - 100;
        const groundY = 560;

        // Flag pole (tall brown rectangle)
        const pole = this.add.rectangle(flagX, groundY - 100, 8, 200, 0x8B4513);

        // Flag (checkered pattern - racing flag style)
        const flagWidth = 80;
        const flagHeight = 50;
        const flagY = groundY - 180;

        // Flag background (white)
        const flagBg = this.add.rectangle(flagX + flagWidth / 2 + 4, flagY, flagWidth, flagHeight, 0xffffff);

        // Checkered pattern
        const squareSize = 10;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 0) {
                    this.add.rectangle(
                        flagX + 4 + (col * squareSize) + squareSize / 2,
                        flagY - flagHeight / 2 + (row * squareSize) + squareSize / 2,
                        squareSize,
                        squareSize,
                        0x000000
                    );
                }
            }
        }

        // Pole top (golden ball)
        this.add.circle(flagX, groundY - 200, 8, 0xFFD700);

        const triggerZone = this.add.rectangle(flagX, groundY - 50, 60, 100);
        triggerZone.setVisible(false);
        this.physics.add.existing(triggerZone, true);

        // Victory text
        this.add.text(flagX, groundY - 220, 'FINISH', {
            fontSize: '18px',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.levelEnd = triggerZone;
    }

    createUpgradeMenu() {
        // Store all menu elements in an array instead of container
        this.upgradeMenuElements = [];

        // Background
        const bg = this.add.rectangle(400, 300, 600, 400, 0x000000, 0.9)
            .setScrollFactor(0)
            .setDepth(200)
            .setVisible(false);
        this.upgradeMenuElements.push(bg);

        // Title
        const title = this.add.text(400, 150, 'UPGRADES', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201)
            .setVisible(false);
        this.upgradeMenuElements.push(title);

        // Upgrade options
        const options = [
            { name: 'Weapon Level', key: 'weaponLevel', cost: 150 },
            { name: 'Weapon Damage', key: 'weaponDamage', cost: 100 },
            { name: 'Max Health', key: 'health', cost: 80 },
            { name: 'Movement Speed', key: 'speed', cost: 120 }
        ];

        this.upgradeButtons = [];
        options.forEach((option, index) => {
            const y = 220 + (index * 50);

            const button = this.add.text(400, y,
                `${option.name} - ${option.cost} coins`,
                { fontSize: '18px', fill: '#ffff00' }
            ).setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0)
                .setDepth(202) // Above everything
                .setVisible(false);

            button.on('pointerdown', () => {
                console.log('Button clicked:', option.key);
                if (this.upgradeManager.purchaseUpgrade(option.key)) {
                    console.log('Upgrade purchased!');
                    this.applyUpgrade(option.key);
                } else {
                    console.log('Not enough coins');
                }
            });

            button.on('pointerover', () => button.setFill('#ffffff'));
            button.on('pointerout', () => button.setFill('#ffff00'));

            this.upgradeMenuElements.push(button);
            this.upgradeButtons.push({ button, option });
        });

        // Close button
        const closeBtn = this.add.text(400, 450, 'Close (U)', {
            fontSize: '16px',
            fill: '#888888'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(202)
            .setVisible(false);

        closeBtn.on('pointerdown', () => {
            console.log('Close button clicked');
            this.toggleUpgradeMenu();
        });

        this.upgradeMenuElements.push(closeBtn);
    }

    toggleUpgradeMenu() {
        this.upgradeMenuActive = !this.upgradeMenuActive;

        // Toggle visibility of all menu elements
        this.upgradeMenuElements.forEach(element => {
            element.setVisible(this.upgradeMenuActive);
        });

        if (this.upgradeMenuActive) {
            this.physics.pause();
            console.log('Upgrade menu opened');
        } else {
            this.physics.resume();
            console.log('Upgrade menu closed');
        }
    }

    applyUpgrade(type) {
        switch (type) {
            case 'weaponLevel':
                this.player.upgradeWeapon();
                break;
            case 'weaponDamage':
                // Applied through damage calculation
                break;
            case 'health':
                this.player.maxHealth += 50;
                this.player.heal(50);
                break;
            case 'speed':
                this.player.speed += 60; // Increased from 30 to 60
                break;
        }
    }

    applyLoadedUpgrades() {
        // Apply saved upgrades to player stats when level starts
        if (!this.upgradeManager || !this.player) {
            console.error('Cannot apply upgrades');
            return;
        }

        const upgrades = this.upgradeManager.currentUpgrades;
        console.log('Applying loaded upgrades:', upgrades);

        // Apply weapon level - directly set it
        const weapon = this.player.weaponManager.getCurrentWeapon();
        weapon.level = upgrades.weaponLevel || 0;
        this.events.emit('weaponSwitched', `Sword Lv.${weapon.level}`);

        if (weapon.level > 0) {
            this.events.emit('weaponSwitched', `Sword Lv.${weapon.level}`);
        }

        // Apply health upgrades
        if (upgrades.health > 0) {
            this.player.maxHealth += upgrades.health * 50;
            this.player.health = this.player.maxHealth;
            this.events.emit('playerHealthChanged', this.player.health, this.player.maxHealth);
        }

        // Apply speed upgrades
        if (upgrades.speed > 0) {
            this.player.speed += upgrades.speed * 60;
        }

        console.log('Applied - HP:', this.player.maxHealth, 'Speed:', this.player.speed, 'Weapon:', weapon.level);
    }

    showTutorial() {
        // Minimalist controls display
        const controlsBox = this.add.container(650, 100).setScrollFactor(0).setDepth(100);

        const controlsBg = this.add.rectangle(0, 0, 140, 180, 0x000000, 0.7);
        controlsBg.setStrokeStyle(2, 0x00ff88);
        controlsBox.add(controlsBg);

        const controlsTitle = this.add.text(0, -70, 'CONTROLS', {
            fontSize: '14px',
            fill: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        controlsBox.add(controlsTitle);

        const controls = [
            '← → Move',
            '↑ Jump',
            'Z Attack',
            'X Dash',
            'C Parry',
            'U Upgrades'
        ];

        controls.forEach((control, i) => {
            const text = this.add.text(0, -40 + (i * 22), control, {
                fontSize: '12px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            controlsBox.add(text);
        });

        this.controlsBox = controlsBox;
    }

    update() {
        if (!this.player) return;

        // Check for U key to toggle upgrade menu
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('U'))) {
            this.toggleUpgradeMenu();
        }

        if (this.upgradeMenuActive) return;

        // Update player
        this.player.update();

        // Update enemies
        this.enemyManager.update(this.player);

        // Collision
        this.physics.collide(this.player, this.platforms);
        this.enemyManager.enemies.forEach(enemy => {
            this.physics.collide(enemy, this.platforms);
            // Don't use collide - it blocks player movement when enemy is underneath
            // Instead, use overlap to push enemies away when too close
            if (this.physics.overlap(this.player, enemy)) {
                // Push enemy away from player
                const direction = enemy.x > this.player.x ? 1 : -1;
                if (enemy.body) {
                    enemy.body.setVelocityX(direction * 200); // Push enemy away
                }
            }
        });

        // Check level completion
        if (this.physics.overlap(this.player, this.levelEnd)) {
            this.completeLevel();
        }

        // Check health pack pickup
        this.healthPacks = this.healthPacks.filter(pack => {
            if (!pack.active) return false;

            if (this.physics.overlap(this.player, pack)) {
                // Don't pick up if health is already full
                if (this.player.health >= this.player.maxHealth) {
                    return true; // Keep the pack, don't pick it up
                }

                // Roll dice 1-20
                const diceRoll = Phaser.Math.Between(1, 20);
                let healAmount;

                if (diceRoll <= 10) {
                    healAmount = 10;
                } else if (diceRoll <= 16) {
                    healAmount = 20;
                } else {
                    healAmount = 30;
                }

                this.player.heal(healAmount);

                // Visual feedback
                const healText = this.add.text(pack.x, pack.y - 30, `+${healAmount} HP!`, {
                    fontSize: '18px',
                    fill: '#00ff00',
                    fontStyle: 'bold'
                });

                this.tweens.add({
                    targets: healText,
                    y: healText.y - 40,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => healText.destroy()
                });

                pack.destroy();
                return false;
            }

            return true;
        });
    }

    onPlayerDeath() {
        // Apply upgrade decay
        this.upgradeManager.reset();

        // Show death screen
        const deathText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'YOU DIED\n\nUpgrades decayed by 50%\n\nClick to respawn',
            {
                fontSize: '32px',
                fill: '#ff0000',
                align: 'center',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(300);

        this.input.once('pointerdown', () => {
            deathText.destroy();
            this.restartLevel();
        });
    }

    restartLevel() {
        // Respawn player
        this.player.respawn();

        // Randomize enemies
        this.enemyManager.randomizePool();
        this.enemyManager.clearAll();

        // Regenerate level
        this.generateLevel();

        // Reset camera
        this.cameras.main.scrollX = 0;
    }

    completeLevel() {
        // Unlock next level
        const unlockedLevels = parseInt(localStorage.getItem('unlockedLevels') || '1');
        if (this.currentLevel >= unlockedLevels && this.currentLevel < 10) {
            localStorage.setItem('unlockedLevels', (this.currentLevel + 1).toString());
        }

        const victoryText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `LEVEL ${this.currentLevel} COMPLETE!\n\nNext level unlocked!\n\nClick to return to hub`,
            {
                fontSize: '32px',
                fill: '#00ff00',
                align: 'center',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(300);

        this.input.once('pointerdown', () => {
            victoryText.destroy();
            this.scene.start('HubScene');
        });
    }
}
