// Boot scene for asset preloading
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load sword slash spritesheet (6 frames) from root
        this.load.spritesheet('sword-slash', 'sword-slash.png', {
            frameWidth: 32,  // Each frame is 32px wide
            frameHeight: 32  // Each frame is 32px tall
        });

        // Load player sprites
        this.load.image('player-idle', 'player-idle.png'); // Single 128x128 frame
        this.load.spritesheet('player-run', 'player-run.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        console.log('Loading player and sword sprites...');

        // Add loading text
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            { fontSize: '32px', fill: '#ffffff' }
        ).setOrigin(0.5);

        // For now, no external assets needed (using procedural graphics)
        // Future: load sprites, sounds, etc.
    }

    create() {
        // Fade in effect
        this.cameras.main.fadeIn(500);

        // Create sword slash animation
        this.anims.create({
            key: 'slash-anim',
            frames: this.anims.generateFrameNumbers('sword-slash', { start: 0, end: 5 }),
            frameRate: 30,
            repeat: 0
        });

        // Create player run animation
        this.anims.create({
            key: 'player-run-anim',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: -1 // Loop forever
        });

        // Start hub menu
        this.time.delayedCall(500, () => {
            this.scene.start('HubScene');
        });
    }
}
