// Mobile touch controls for Android/iOS with virtual joystick
class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = this.isMobileDevice();

        // Joystick state
        this.joystickX = 0; // -1 to 1
        this.joystickY = 0; // -1 to 1
        this.joystickActive = false;

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
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createControls() {
        const depth = 1000;
        const alpha = 0.7;

        // Left side - Virtual Joystick
        this.createJoystick(depth, alpha);

        // Right side - Action buttons
        this.createActionButtons(depth, alpha);
    }

    createJoystick(depth, alpha) {
        const baseX = 130;
        const baseY = this.scene.cameras.main.height - 130;
        const baseRadius = 70;
        const handleRadius = 35;

        // Joystick base (outer circle - dark green)
        this.joystickBase = this.scene.add.circle(baseX, baseY, baseRadius, 0x2d5a27, alpha)
            .setScrollFactor(0)
            .setDepth(depth)
            .setStrokeStyle(4, 0x4a8a40);

        // Joystick handle (inner circle - white, draggable)
        this.joystickHandle = this.scene.add.circle(baseX, baseY, handleRadius, 0xffffff, 0.9)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive({ draggable: true });

        // Store joystick center position
        this.joystickCenterX = baseX;
        this.joystickCenterY = baseY;
        this.joystickMaxDistance = baseRadius - handleRadius / 2;

        // Handle joystick input
        this.joystickHandle.on('pointerdown', () => {
            this.joystickActive = true;
        });

        this.joystickHandle.on('pointermove', (pointer) => {
            if (!this.joystickActive) return;
            this.updateJoystickPosition(pointer.x, pointer.y);
        });

        this.joystickHandle.on('pointerup', () => {
            this.resetJoystick();
        });

        this.joystickHandle.on('pointerout', () => {
            this.resetJoystick();
        });

        // Also allow touching the base to start joystick
        this.joystickBase.setInteractive();
        this.joystickBase.on('pointerdown', (pointer) => {
            this.joystickActive = true;
            this.updateJoystickPosition(pointer.x, pointer.y);
        });

        this.joystickBase.on('pointermove', (pointer) => {
            if (!this.joystickActive) return;
            this.updateJoystickPosition(pointer.x, pointer.y);
        });

        this.joystickBase.on('pointerup', () => {
            this.resetJoystick();
        });
    }

    updateJoystickPosition(pointerX, pointerY) {
        // Calculate distance from center
        const dx = pointerX - this.joystickCenterX;
        const dy = pointerY - this.joystickCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Clamp to max distance
        let handleX, handleY;
        if (distance > this.joystickMaxDistance) {
            const angle = Math.atan2(dy, dx);
            handleX = this.joystickCenterX + Math.cos(angle) * this.joystickMaxDistance;
            handleY = this.joystickCenterY + Math.sin(angle) * this.joystickMaxDistance;
        } else {
            handleX = pointerX;
            handleY = pointerY;
        }

        // Update handle position
        this.joystickHandle.x = handleX;
        this.joystickHandle.y = handleY;

        // Calculate normalized joystick values (-1 to 1)
        this.joystickX = (handleX - this.joystickCenterX) / this.joystickMaxDistance;
        this.joystickY = (handleY - this.joystickCenterY) / this.joystickMaxDistance;

        // Update button states based on joystick position
        this.leftPressed = this.joystickX < -0.3;
        this.rightPressed = this.joystickX > 0.3;

        // Jump when pushing upward (between 9 o'clock and 3 o'clock)
        // Y < 0 means upper half, threshold of -0.3 for sensitivity
        const isInUpperHalf = this.joystickY < -0.3;
        const distanceFromCenter = Math.sqrt(this.joystickX * this.joystickX + this.joystickY * this.joystickY);
        const isMovedEnough = distanceFromCenter > 0.4;

        if (isInUpperHalf && isMovedEnough && !this.jumpPressed) {
            this.jumpJustPressed = true;
        }
        this.jumpPressed = isInUpperHalf && isMovedEnough;
    }

    resetJoystick() {
        this.joystickActive = false;
        this.joystickHandle.x = this.joystickCenterX;
        this.joystickHandle.y = this.joystickCenterY;
        this.joystickX = 0;
        this.joystickY = 0;
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
    }

    createActionButtons(depth, alpha) {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const btnX = screenWidth - 100;
        const btnY = screenHeight - 100;

        // Attack button (red, main action - BIGGER)
        this.attackBtn = this.scene.add.circle(btnX, btnY, 50, 0xff4444, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.attackText = this.scene.add.text(btnX, btnY, 'ATK', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.attackBtn.on('pointerdown', () => {
            this.attackPressed = true;
            this.attackJustPressed = true;
        });
        this.attackBtn.on('pointerup', () => this.attackPressed = false);
        this.attackBtn.on('pointerout', () => this.attackPressed = false);

        // Dash button (blue)
        this.dashBtn = this.scene.add.circle(btnX - 80, btnY + 10, 40, 0x4488ff, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.dashText = this.scene.add.text(btnX - 80, btnY + 10, 'DSH', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);

        this.dashBtn.on('pointerdown', () => {
            this.dashPressed = true;
            this.dashJustPressed = true;
        });
        this.dashBtn.on('pointerup', () => this.dashPressed = false);
        this.dashBtn.on('pointerout', () => this.dashPressed = false);

        // Parry button (yellow)
        this.parryBtn = this.scene.add.circle(btnX + 10, btnY - 80, 40, 0xffcc00, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.parryText = this.scene.add.text(btnX + 10, btnY - 80, 'PRY', {
            fontSize: '16px',
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
        this.upgradeBtn = this.scene.add.circle(screenWidth - 50, 50, 35, 0x9933ff, alpha)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setInteractive();

        this.upgradeText = this.scene.add.text(screenWidth - 50, 50, 'UPG', {
            fontSize: '14px',
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

        const elements = [
            this.joystickBase, this.joystickHandle,
            this.attackBtn, this.attackText, this.dashBtn, this.dashText,
            this.parryBtn, this.parryText, this.upgradeBtn, this.upgradeText
        ];

        elements.forEach(el => {
            if (el) el.destroy();
        });
    }
}
