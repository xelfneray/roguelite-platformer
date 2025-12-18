// Hub scene for level selection
class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        // Get unlocked levels from localStorage
        this.unlockedLevels = parseInt(localStorage.getItem('unlockedLevels') || '1');

        // Background
        this.cameras.main.setBackgroundColor('#0a0a1e');

        // Title
        const title = this.add.text(400, 80, 'LEVEL SELECT', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(400, 130, 'Choose your challenge', {
            fontSize: '18px',
            fill: '#888888'
        }).setOrigin(0.5);

        // Create level buttons in a grid (2 rows x 5 columns)
        const startX = 200;
        const startY = 200;
        const spacingX = 120;
        const spacingY = 120;

        for (let i = 0; i < 10; i++) {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const x = startX + (col * spacingX);
            const y = startY + (row * spacingY);
            const level = i + 1;
            const unlocked = level <= this.unlockedLevels;

            this.createLevelButton(x, y, level, unlocked);
        }

        // Instructions
        const instructions = this.add.text(400, 500, 'Click on a level to begin', {
            fontSize: '16px',
            fill: '#666666'
        }).setOrigin(0.5);

        // Progress text
        const progress = this.add.text(400, 540, `Levels Unlocked: ${this.unlockedLevels}/10`, {
            fontSize: '14px',
            fill: '#00ff88'
        }).setOrigin(0.5);

        // Reset Progress Button
        const resetBtn = this.add.rectangle(400, 400, 200, 40, 0x880000)
            .setStrokeStyle(2, 0xff0000)
            .setInteractive({ useHandCursor: true });

        const resetText = this.add.text(400, 400, '🔄 RESET ALL PROGRESS', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        resetBtn.on('pointerover', () => {
            resetBtn.setFillStyle(0xaa0000);
        });

        resetBtn.on('pointerout', () => {
            resetBtn.setFillStyle(0x880000);
        });

        resetBtn.on('pointerdown', () => {
            // Clear all saved data
            localStorage.removeItem('playerUpgrades');
            localStorage.setItem('unlockedLevels', '1');

            // Show confirmation
            const confirmText = this.add.text(400, 440, 'Progress Reset!', {
                fontSize: '16px',
                fill: '#ff4444',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: confirmText,
                alpha: 0,
                duration: 2000,
                onComplete: () => confirmText.destroy()
            });

            // Refresh scene
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        });
    }

    createLevelButton(x, y, level, unlocked) {
        // Button background
        const bg = this.add.rectangle(x, y, 80, 80, unlocked ? 0x1a2a3e : 0x0f0f0f)
            .setStrokeStyle(2, unlocked ? 0x00ff88 : 0x333333);

        // Level number
        const text = this.add.text(x, y, level.toString(), {
            fontSize: '32px',
            fill: unlocked ? '#ffffff' : '#444444',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Lock icon for locked levels
        if (!unlocked) {
            const lock = this.add.text(x, y + 30, '🔒', {
                fontSize: '16px'
            }).setOrigin(0.5);
        }

        if (unlocked) {
            // Make interactive
            bg.setInteractive({ useHandCursor: true });
            text.setInteractive({ useHandCursor: true });

            // Hover effects
            bg.on('pointerover', () => {
                bg.setFillStyle(0x2a3a4e);
                bg.setScale(1.05);
                text.setScale(1.05);
            });

            bg.on('pointerout', () => {
                bg.setFillStyle(0x1a2a3e);
                bg.setScale(1);
                text.setScale(1);
            });

            // Click to start level
            const startLevel = () => {
                this.scene.start('GameScene', { level: level });
            };

            bg.on('pointerdown', startLevel);
            text.on('pointerdown', startLevel);
        }
    }
}
