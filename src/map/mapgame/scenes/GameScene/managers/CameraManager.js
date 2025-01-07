import { DEPTH } from '../constants/depth.js';

export class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0, cameraX: 0, cameraY: 0 };
        this.lastScrollX = 0;
        this.lastScrollY = 0;
        this.zoomTimeout = null;
    }

    initialize() {
        this.setupDragControls();
        this.setupZoomControls();
        this.setupUpdate();
        this.scene.input.emit('wheel', null, null, 0, 1000, 0);
    }

    setupDragControls() {
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.dragStart = {
                    x: pointer.x,
                    y: pointer.y,
                    cameraX: this.scene.cameras.main.scrollX,
                    cameraY: this.scene.cameras.main.scrollY
                };
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (!pointer.leftButtonDown()) {
                this.isDragging = false;
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const dragX = pointer.x - this.dragStart.x;
                const dragY = pointer.y - this.dragStart.y;
                
                this.scene.cameras.main.scrollX = this.dragStart.cameraX - dragX / this.scene.cameras.main.zoom;
                this.scene.cameras.main.scrollY = this.dragStart.cameraY - dragY / this.scene.cameras.main.zoom;
                
                this.scene.generateTiles();
            }
        });
    }

    setupZoomControls() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoomFactor = 0.001;
            let newZoom = this.scene.cameras.main.zoom + deltaY * zoomFactor;
            newZoom = Phaser.Math.Clamp(newZoom, 0.2, 3);
            
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                zoom: newZoom,
                duration: 100,
                ease: 'Linear',
                onComplete: () => {
                    if (this.zoomTimeout) clearTimeout(this.zoomTimeout);
                    this.zoomTimeout = setTimeout(() => {
                        this.scene.generateTiles();
                    }, 150);
                }
            });
        });
    }

    setupUpdate() {
        const scrollThreshold = this.scene.tileSize / 2;

        this.scene.events.on('update', () => {
            if (this.scene.cameras.main) {
                const deltaX = Math.abs(this.scene.cameras.main.scrollX - this.lastScrollX);
                const deltaY = Math.abs(this.scene.cameras.main.scrollY - this.lastScrollY);

                if (deltaX > scrollThreshold || deltaY > scrollThreshold) {
                    this.scene.generateTiles();
                    this.lastScrollX = this.scene.cameras.main.scrollX;
                    this.lastScrollY = this.scene.cameras.main.scrollY;
                }
            }
        });
    }

    centerOnPoint(x, y) {
        const { x: centerX, y: centerY } = this.scene.gameToPhaserCoords(x, y);
        this.scene.cameras.main.centerOn(centerX, centerY);
    }

    setZoom(zoom) {
        this.scene.cameras.main.setZoom(zoom);
    }
} 