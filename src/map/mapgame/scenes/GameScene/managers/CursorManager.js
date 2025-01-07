export class CursorManager {
    constructor(scene) {
        this.scene = scene;
        this.cursorUrl = '/cursor.png';
        this.cursorHoverUrl = '/cursorHover.png';
        this.initialize();
    }

    initialize() {
        this.scene.input.setDefaultCursor(`url(${this.cursorUrl}), pointer`);
        
        this.setupHoverCursorForAllInteractiveObjects();
    }

    setupHoverCursorForAllInteractiveObjects() {
        this.scene.input.on('gameobjectover', (pointer, gameObject) => {
            this.scene.input.setDefaultCursor(`url(${this.cursorHoverUrl}), pointer`);
        });

        this.scene.input.on('gameobjectout', (pointer, gameObject) => {
            this.scene.input.setDefaultCursor(`url(${this.cursorUrl}), pointer`);
        });
    }
} 




