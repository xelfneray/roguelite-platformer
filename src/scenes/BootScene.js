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
        this.load.spritesheet('player-idle', 'player-idle.png', {
            frameWidth: 128,  // 4 frames, each 128px wide
            frameHeight: 128
        });
        this.load.spritesheet('player-run', 'player-run.png', {
            frameWidth: 128,
            frameHeight: 128
        });

        // Load attack sprites
        this.load.spritesheet('run-to-attack', 'run-to-attack.png', {
            frameWidth: 128,  // 8 frames for run-attack animation
            frameHeight: 128
        });
        this.load.spritesheet('attacking', 'attacking.png', {
            frameWidth: 128,  // Standing attack frames
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

        // Create player run animation (12 frames)
        this.anims.create({
            key: 'player-run-anim',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 11 }),
            frameRate: 16,
            repeat: -1 // Loop forever
        });

        // Create player idle animation (4 frames)
        this.anims.create({
            key: 'player-idle-anim',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1 // Loop forever
        });

        // Create run-attack animation (7 frames)
        this.anims.create({
            key: 'run-attack-anim',
            frames: this.anims.generateFrameNumbers('run-to-attack', { start: 0, end: 6 }),
            frameRate: 14,
            repeat: 0 // Play once
        });

        // Create standing attack animation (7 frames)
        this.anims.create({
            key: 'stand-attack-anim',
            frames: this.anims.generateFrameNumbers('attacking', { start: 0, end: 6 }),
            frameRate: 14,
            repeat: 0 // Play once
        });

        // Start hub menu
        this.time.delayedCall(500, () => {
            this.scene.start('HubScene');
        });
    }
}
