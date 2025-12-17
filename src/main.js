// Main game initialization
const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    parent: 'game-container',
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
