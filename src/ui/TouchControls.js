// Mobile touch controls for Android/iOS
class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = this.isMobileDevice();

        // Control states
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        this.attackPressed = false;
        this.dashPressed = false;
        this.parryPressed = false;

        // Just-pressed states for single-fire actions
        this.jumpJustPressed = false;
        this.attackJustPressed = false;
        this.dashJustPressed = false;
        this.parryJustPressed = false;

        if (this.isEnabled) {
            this.createControls();
        }
    }

    isMobileDevice() {
        // Check for touch support or mobile user agent
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createControls() {
        const depth = 1000;
        const alpha = 0.6;

        // Left side - Movement controls
        this.createMovementPad(depth, alpha);

        // Right side - Action buttons
        this.createActionButtons(depth, alpha);
    }

    createMovementPad(depth, alpha) {
        const padX = 120;
        const padY = this.scene.cameras.main.height - 120;

        // Movement pad background
        this.movePadBg = this.scene.add.circle(padX, padY, 80, 0x333333, alpha)
            .setScrollFactor(0)
            .setDepth(depth);

        // Left button
        this.leftBtn = this.scene.add.circle(padX - 50, padY, 35, 0x4a90d9, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.leftArrow = this.scene.add.text(padX - 50, padY, '◀', {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.leftBtn.on('pointerdown', () => this.leftPressed = true);
        this.leftBtn.on('pointerup', () => this.leftPressed = false);
        this.leftBtn.on('pointerout', () => this.leftPressed = false);

        // Right button
        this.rightBtn = this.scene.add.circle(padX + 50, padY, 35, 0x4a90d9, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.rightArrow = this.scene.add.text(padX + 50, padY, '▶', {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.rightBtn.on('pointerdown', () => this.rightPressed = true);
        this.rightBtn.on('pointerup', () => this.rightPressed = false);
        this.rightBtn.on('pointerout', () => this.rightPressed = false);

        // Jump button (center-up of pad)
        this.jumpBtn = this.scene.add.circle(padX, padY - 50, 35, 0x50c878, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.jumpArrow = this.scene.add.text(padX, padY - 50, '▲', {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.jumpBtn.on('pointerdown', () => {
            this.jumpPressed = true;
            this.jumpJustPressed = true;
        });
        this.jumpBtn.on('pointerup', () => this.jumpPressed = false);
        this.jumpBtn.on('pointerout', () => this.jumpPressed = false);
    }

    createActionButtons(depth, alpha) {
        const screenWidth = this.scene.cameras.main.width;
        const btnX = screenWidth - 120;
        const btnY = this.scene.cameras.main.height - 120;

        // Attack button (red, main action)
        this.attackBtn = this.scene.add.circle(btnX, btnY, 45, 0xff4444, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.attackText = this.scene.add.text(btnX, btnY, 'ATK', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.attackBtn.on('pointerdown', () => {
            this.attackPressed = true;
            this.attackJustPressed = true;
        });
        this.attackBtn.on('pointerup', () => this.attackPressed = false);
        this.attackBtn.on('pointerout', () => this.attackPressed = false);

        // Dash button (blue, secondary)
        this.dashBtn = this.scene.add.circle(btnX - 70, btnY + 20, 35, 0x4488ff, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.dashText = this.scene.add.text(btnX - 70, btnY + 20, 'DSH', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.dashBtn.on('pointerdown', () => {
            this.dashPressed = true;
            this.dashJustPressed = true;
        });
        this.dashBtn.on('pointerup', () => this.dashPressed = false);
        this.dashBtn.on('pointerout', () => this.dashPressed = false);

        // Parry button (yellow, defensive)
        this.parryBtn = this.scene.add.circle(btnX + 20, btnY - 70, 35, 0xffcc00, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.parryText = this.scene.add.text(btnX + 20, btnY - 70, 'PRY', {
            fontSize: '14px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.parryBtn.on('pointerdown', () => {
            this.parryPressed = true;
            this.parryJustPressed = true;
        });
        this.parryBtn.on('pointerup', () => this.parryPressed = false);
        this.parryBtn.on('pointerout', () => this.parryPressed = false);

        // Upgrade button (top right, purple)
        this.upgradeBtn = this.scene.add.circle(screenWidth - 50, 50, 30, 0x9933ff, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.upgradeText = this.scene.add.text(screenWidth - 50, 50, 'UPG', {
            fontSize: '12px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.upgradeBtn.on('pointerdown', () => {
            if (this.scene.toggleUpgradeMenu) {
                this.scene.toggleUpgradeMenu();
            }
        });
    }

    // Check if a "just pressed" action happened (single fire)
    justPressed(action) {
        let result = false;

        switch (action) {
            case 'jump':
                result = this.jumpJustPressed;
                this.jumpJustPressed = false;
                break;
            case 'attack':
                result = this.attackJustPressed;
                this.attackJustPressed = false;
                break;
            case 'dash':
                result = this.dashJustPressed;
                this.dashJustPressed = false;
                break;
            case 'parry':
                result = this.parryJustPressed;
                this.parryJustPressed = false;
                break;
        }

        return result;
    }

    // Check if an action is currently being held
    isDown(action) {
        switch (action) {
            case 'left': return this.leftPressed;
            case 'right': return this.rightPressed;
            case 'jump': return this.jumpPressed;
            case 'attack': return this.attackPressed;
            case 'dash': return this.dashPressed;
            case 'parry': return this.parryPressed;
            default: return false;
        }
    }

    destroy() {
        if (!this.isEnabled) return;

        // Clean up all UI elements
        const elements = [
            this.movePadBg, this.leftBtn, this.leftArrow,
            this.rightBtn, this.rightArrow, this.jumpBtn, this.jumpArrow,
            this.attackBtn, this.attackText, this.dashBtn, this.dashText,
            this.parryBtn, this.parryText, this.upgradeBtn, this.upgradeText
        ];

        elements.forEach(el => {
            if (el) el.destroy();
        });
    }
}
