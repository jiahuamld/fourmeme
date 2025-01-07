export class ZoomControl {
    constructor(scene) {
        this.scene = scene;
        
        this.createZoomButtons();
        
        setTimeout(() => {
            const camera = this.scene.cameras.main;
            camera.zoom = 0.5;
            this.scene.generateTiles();
            
            camera.scrollX = -1100;
            camera.scrollY = -1000;
        }, 400);
    }

    createZoomButtons() {
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'zoom-controls';
        
        const zoomInBtn = document.createElement('button');
        zoomInBtn.innerHTML = '+';
        zoomInBtn.className = 'zoom-btn zoom-in';
        
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.innerHTML = '−';
        zoomOutBtn.className = 'zoom-btn zoom-out';
        
        zoomContainer.appendChild(zoomInBtn);
        zoomContainer.appendChild(zoomOutBtn);
        
        document.body.appendChild(zoomContainer);
        
        zoomInBtn.addEventListener('click', () => this.handleZoom(0.2));
        zoomOutBtn.addEventListener('click', () => this.handleZoom(-0.2));
    }

    handleZoom(delta) {
        const camera = this.scene.cameras.main;
        let newZoom = camera.zoom + delta;
        newZoom = Phaser.Math.Clamp(newZoom, 0.05, 3);

        this.scene.tweens.add({
            targets: camera,
            zoom: newZoom,
            duration: 100,
            ease: 'Linear',
            onComplete: () => {
                this.scene.generateTiles();
            }
        });
    }

    destroy() {
        const zoomContainer = document.querySelector('.zoom-controls');
        if (zoomContainer) {
            zoomContainer.remove();
        }
    }
} 