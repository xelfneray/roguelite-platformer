// Archer - Ranged enemy that maintains distance
class Archer extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, GameConfig.enemies.archer);

        // Change size BEFORE physics setup
        this.setSize(30, 40); // Smaller archer

        // CRITICAL: Completely rebuild physics body after setSize
        // setSize can destroy/recreate the physics body
        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);
        this.body.setGravityY(800);
        this.body.setBounce(0);
        this.body.setDrag(100, 0);

        console.log('Archer created with gravity:', this.body.gravity.y);

        this.projectileCooldown = 1500;

        // More aggressive settings
        this.attackRange = 300; // Increased from 200
        this.aggroRange = 500; // Increased from 400

        // Flee behavior state
        this.behaviorState = 'waiting'; // 'waiting', 'attacking', 'fleeing'
        this.waitTimer = 0;
        this.fleeTimer = 0;
        this.hasAttacked = false;
    }

    update(player) {
        if (!this.active || this.health <= 0) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );

        // REMOVED: Aggro range check - Archers always engage

        // Flee behavior: wait 3s -> attack -> flee 2s -> repeat
        switch (this.behaviorState) {
            case 'waiting':
                this.body.setVelocityX(0);
                this.waitTimer++;

                // After 1.5 seconds (90 frames at 60fps), attack
                if (this.waitTimer >= 90) {
                    this.behaviorState = 'attacking';
                    this.hasAttacked = false;
                    this.waitTimer = 0;
                }
                break;

            case 'attacking':
                this.body.setVelocityX(0);

                if (!this.hasAttacked && distanceToPlayer < this.attackRange) {
                    this.performAttack(player);
                    this.hasAttacked = true;
                    this.behaviorState = 'fleeing';
                    this.fleeTimer = 0;
                }
                break;

            case 'fleeing':
                // Flee away from player
                const direction = player.x > this.x ? -1 : 1;
                this.body.setVelocityX(direction * this.speed * 1.5);

                this.fleeTimer++;

                // After 1 second (60 frames), return to waiting
                if (this.fleeTimer >= 60) {
                    this.behaviorState = 'waiting';
                    this.fleeTimer = 0;
                    this.waitTimer = 0;
                }
                break;
        }

        // Update health bar position
        this.updateHealthBar();
    }

    performAttack(player) {
        // Shoot arrow projectile
        const arrow = this.scene.add.rectangle(
            this.x,
            this.y,
            20,
            4,
            0x8b4513
        );

        this.scene.physics.add.existing(arrow);

        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            player.x, player.y
        );

        arrow.body.setVelocity(
            Math.cos(angle) * 250,
            Math.sin(angle) * 250
        );

        // Destroy after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (arrow.active) arrow.destroy();
        });

        // Check for player hit
        const hitCheck = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (!arrow.active) {
                    hitCheck.remove();
                    return;
                }

                const distance = Phaser.Math.Distance.Between(
                    arrow.x, arrow.y,
                    player.x, player.y
                );

                if (distance < 30) {
                    if (player.takeDamage) {
                        player.takeDamage(this.damage);
                    }
                    arrow.destroy();
                    hitCheck.remove();
                }
            },
            loop: true
        });
    }
}
