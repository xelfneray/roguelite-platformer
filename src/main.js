// Main game initialization
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 225
        },
        max: {
            width: 1600,
            height: 900
        }
    },
    input: {
        touch: true,
        activePointers: 4 // Support multiple touch points
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, HubScene, GameScene],
    backgroundColor: '#0f0f1e'
};

const game = new Phaser.Game(config);
