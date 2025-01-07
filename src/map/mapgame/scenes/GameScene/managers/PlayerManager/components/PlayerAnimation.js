export class PlayerAnimation {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
    }

    initialize() {
        if (!this.initialized && this.scene.anims) {
            this.createAnimations();
            this.initialized = true;
        }
    }

    createAnimations() {
        if (!this.scene.textures.exists('p1')) {
            console.error('base_sprite texture not found');
            return;
        }

        const animations = [
            { 
                key: 'left', 
                frames: this.scene.anims.generateFrameNumbers('p1', { 
                    frames: [0, 1, 2, 3] 
                })
            },
            { 
                key: 'right', 
                frames: this.scene.anims.generateFrameNumbers('p1', { 
                    frames: [5, 6, 7, 8] 
                })
            },
            { 
                key: 'up', 
                frames: this.scene.anims.generateFrameNumbers('p2', { 
                    frames: [5, 6, 7, 8] 
                })
            },
            { 
                key: 'down', 
                frames: this.scene.anims.generateFrameNumbers('p2', { 
                    frames: [0, 1, 2, 3] 
                })
            }
        ];

        const bikeAnimations = [
            { 
                key: 'bike-left', 
                frames: this.scene.anims.generateFrameNumbers('Bike', { 
                    frames: [0, 1, 2, 3] 
                })
            },
            { 
                key: 'bike-right', 
                frames: this.scene.anims.generateFrameNumbers('Bike', { 
                    frames: [5, 6, 7, 8] 
                })
            },
            { 
                key: 'bike-up', 
                frames: this.scene.anims.generateFrameNumbers('Bike', { 
                    frames: [5, 6, 7, 8] 
                })
            },
            { 
                key: 'bike-down', 
                frames: this.scene.anims.generateFrameNumbers('Bike', { 
                    frames: [0, 1, 2, 3] 
                })
            }
        ];

        [...animations, ...bikeAnimations].forEach(({ key, frames }) => {
            if (this.scene.anims.exists(key)) {
                this.scene.anims.remove(key);
            }

            const config = {
                key: key,
                frames: frames,
                frameRate: 8,
                repeat: -1,
                duration: null,
                yoyo: false
            };

            try {
                this.scene.anims.create(config);
   
            } catch (error) {
                console.error(`Failed to create animation ${key}:`, error);
            }
        });
    }

    updateAnimation(player, playerData) {
        if (!this.initialized) {
            this.initialize();
        }

        if (!player?.character || !playerData) {
            return;
        }

        const character = player.character;
        
        try {
            const { x: worldX, y: worldY } = this.scene.gameToPhaserCoords(
                playerData.locationX,
                playerData.locationY
            );

            const currentX = player.x;
            const targetX = worldX + this.scene.tileSize / 2;
            const currentY = player.y;
            const targetY = worldY + this.scene.tileSize / 2;

            const deltaX = targetX - currentX;
            const deltaY = targetY - currentY;
            const moveThreshold = 1;

            if ((Math.abs(deltaX) > moveThreshold || Math.abs(deltaY) > moveThreshold)) {
                
                let direction;
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    direction = deltaX < 0 ? 'left' : 'right';
                } else {
                    direction = deltaY < 0 ? 'up' : 'down';
                }

                player.lastDirection = direction;
                const animSet = player.animationSet || 'default';
                const animKey = animSet === 'default' ? 
                    direction : 
                    `${animSet.toLowerCase()}-${direction}`;

                if (!character.anims.isPlaying || character.anims.currentAnim?.key !== animKey) {
                    character.anims.play(animKey, true);
                }
            } else {
                if (character.anims?.isPlaying) {
                    character.anims.stop();
                }
                this.setIdleFrame(character, player.lastDirection || 'down');
            }
        } catch (error) {
            console.error('Error in updateAnimation:', error);
            if (character?.setFrame) {
                this.setIdleFrame(character, 'down');
            }
        }
    }

    setIdleFrame(character, direction) {
        if (!character?.setFrame) {
            return;
        }

        const idleFrames = {
            'up': 4,
            'down': 4,
            'left': 4,
            'right': 4
        };

        try {
            const frame = idleFrames[direction] || 4;
            character.setFrame(frame);
        } catch (error) {
            console.warn('Error setting idle frame:', error);
            try {
                character.setFrame(4);
            } catch (e) {
                console.error('Failed to set default frame:', e);
            }
        }
    }
} 