export class TextureManager {
    constructor(scene) {
        this.scene = scene;
        this.textureUsageCount = {};
        
        this.textureConfigs = {
            grass: {
                key: 'grass',
                depth: 0
            },
            ground: {
                key: 'ground3',
                depth: 1
            },
            crossroad: {
                key: 'road2',
                depth: 2
            },
            roadH: {
                key: 'road2',
                depth: 3
            },
            roadV: {
                key: 'road3',
                depth: 3
            }
        };
    }

    initialize(tileSize) {
        Object.keys(this.textureConfigs).forEach(key => {
            this.textureConfigs[key].displayWidth = tileSize;
            this.textureConfigs[key].displayHeight = tileSize;
        });

        this.textureConfigs.roadH.displayWidth = tileSize * 1.5;
        this.textureConfigs.roadH.displayHeight = tileSize / 2;
        this.textureConfigs.roadV.displayWidth = tileSize / 2;
        this.textureConfigs.roadV.displayHeight = tileSize * 1.5;

        Object.keys(this.textureConfigs).forEach(key => {
            this.textureUsageCount[key] = 0;
        });
    }

    getInstance(type, x, y) {
        const config = this.textureConfigs[type];
        if (!config) return null;

        this.textureUsageCount[type]++;

        const image = this.scene.add.image(x, y, config.key)
            .setOrigin(0)
            .setDisplaySize(config.displayWidth, config.displayHeight)
            .setAlpha(config.alpha)
            .setDepth(config.depth);

        image.textureType = type;
        
        return image;
    }

    recycle(image) {
        if (!image || !image.textureType) return;

        this.textureUsageCount[image.textureType]--;

        image.destroy();
    }

    getUsageStats() {
        return { ...this.textureUsageCount };
    }
} 