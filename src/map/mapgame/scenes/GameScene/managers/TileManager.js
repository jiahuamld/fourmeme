import { DEPTH } from '../constants/depth.js';

export class TileManager {
    constructor(scene, gridSize) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.activeTiles = {};
        this.textureManager = scene.textureManager;
        this.activeTrees = new Map();
        this.treePool = [];
        this.tileCache = new Map();
        this.pendingRemoval = new Set();
        this.worker = new Worker(new URL('../workers/tileWorker.js', import.meta.url));
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }

    generateTiles(camera, tileSize) {
        this.worker.postMessage({
            type: 'calculateViewport',
            camera: {
                x: camera.worldView.x,
                y: camera.worldView.y,
                width: camera.worldView.width,
                height: camera.worldView.height
            },
            tileSize,
            buffer: 2
        });
    }

    handleWorkerMessage(event) {
        const { startX, endX, startY, endY } = event.data;
        this.removeOutOfViewTiles(startX, endX, startY, endY);
        this.cleanupTrees(startX, endX, startY, endY, this.scene.tileSize);
        this.createNewTiles(startX, endX, startY, endY, this.scene.tileSize);
    }

    removeOutOfViewTiles(startX, endX, startY, endY) {
        for (let key in this.activeTiles) {
            const [x, y] = key.split(':').map(Number);
            if (x < startX || x > endX || y < startY || y > endY) {
                this.pendingRemoval.add(key);
            }
        }
        
        if (this.pendingRemoval.size > 0) {
            setTimeout(() => this.processPendingRemovals(), 100);
        }
    }

    processPendingRemovals() {
        for (const key of this.pendingRemoval) {
            if (this.activeTiles[key]) {
                this.activeTiles[key].forEach(tile => {
                    const tileType = tile.textureType;
                    if (!this.tileCache.has(tileType)) {
                        this.tileCache.set(tileType, []);
                    }
                    this.tileCache.get(tileType).push(tile);
                    tile.setActive(false).setVisible(false);
                });
                delete this.activeTiles[key];
            }
        }
        this.pendingRemoval.clear();
    }

    cleanupTrees(startX, endX, startY, endY, tileSize) {
        this.activeTrees.forEach((tree, key) => {
            const [x, y] = key.split(':').map(Number);
            if (x < startX || x > endX || y < startY || y > endY) {
                tree.setActive(false).setVisible(false);
                this.scene.tweens.killTweensOf(tree);
                this.treePool.push(tree);
                this.activeTrees.delete(key);
            }
        });
    }

    createNewTiles(startX, endX, startY, endY, tileSize) {
        const random = new Phaser.Math.RandomDataGenerator([`${startX}-${endY}`]);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const tileKey = `${x}:${y}`;
                if (!this.activeTiles[tileKey]) {
                    const worldCoords = this.scene.gameToPhaserCoords(x, y);
                    const tiles = [];

                    if (x === 0 || y === 0) {
                        const grayRoad = this.scene.add.sprite(
                            worldCoords.x,
                            worldCoords.y,
                            'gray_road'
                        )
                        .setOrigin(0)
                        .setDisplaySize(tileSize, tileSize)
                        .setDepth(9999);
                        tiles.push(grayRoad);
                    }

                    const addTile = (type, x, y, depth) => {
                        let tile;
                        const config = this.textureManager.textureConfigs[type];
                        
                        if (this.tileCache.has(type) && this.tileCache.get(type).length > 0) {
                            tile = this.tileCache.get(type).pop();
                            tile.setPosition(x, y)
                                .setOrigin(0)
                                .setDisplaySize(config.displayWidth, config.displayHeight)
                                .setAlpha(config.alpha)
                                .setDepth(depth || config.depth)
                                .setActive(true)
                                .setVisible(true)
                                .setTint(0xffffff)
                                .clearTint();
                        } else {
                            tile = this.textureManager.getInstance(type, x, y);
                            if (depth) {
                                tile.setDepth(depth);
                            }
                        }
                        return tile;
                    };

                    if (x % 3 === 0 && y % 3 === 0) {
                        const grassTile = addTile('grass', worldCoords.x, worldCoords.y, DEPTH.MAP.GRASS);
                        grassTile.setDisplaySize(tileSize * 3, tileSize * 3);
                        tiles.push(grassTile);
                    }

                    if (x % this.gridSize === 0 || y % this.gridSize === 0) {
                        if (x % this.gridSize === 0 && y % this.gridSize === 0) {
                            tiles.push(addTile('crossroad', worldCoords.x, worldCoords.y, DEPTH.MAP.ROAD));
                        } else if (y % this.gridSize === 0) {
                            tiles.push(addTile('roadH', worldCoords.x - tileSize / 4, worldCoords.y + tileSize / 4, DEPTH.MAP.ROAD));
                        } else if (x % this.gridSize === 0) {
                            tiles.push(addTile('roadV', worldCoords.x + tileSize / 4, worldCoords.y - tileSize / 4, DEPTH.MAP.ROAD));
                        }
                    } else {
                        this.tryGenerateTree(x, y, worldCoords, random);
                    }

                    this.activeTiles[tileKey] = tiles;
                }
            }
        }
    }

    tryGenerateTree(x, y, worldCoords, random) {
        const treeKey = `${x}:${y}`;
        if (this.activeTrees.has(treeKey)) return;

        if (this.isNearBuilding(worldCoords.x, worldCoords.y)) return;

        if (random.frac() < 0.01) {
            let tree;
            if (this.treePool.length > 0) {
                tree = this.treePool.pop();
                tree.setActive(true)
                    .setVisible(true)
                    .setPosition(worldCoords.x, worldCoords.y)
                    .setScale(2);
            } else {
                tree = this.scene.add.sprite(worldCoords.x, worldCoords.y, 'Coconut')
                    .setDepth(DEPTH.TREE.COCONUT)
                    .setScale(2)
                    .setOrigin(0.5, 1.0);
            }

            this.activeTrees.set(treeKey, tree);
        }
    }

    isNearBuilding(x, y) {
        const buildings = this.scene.buildingGroups.getChildren();
        const safeDistance = this.scene.tileSize * 3;

        return buildings.some(building => {
            if (!building.getData('sprite')) return false;
            const sprite = building.getData('sprite');
            const dx = x - sprite.x;
            const dy = y - sprite.y;
            return (dx * dx + dy * dy) < (safeDistance * safeDistance);
        });
    }

    cleanup() {
        this.tileCache.forEach(tiles => {
            tiles.forEach(tile => tile.destroy());
        });
        this.tileCache.clear();
        
        this.worker.terminate();
        
        Object.values(this.activeTiles).forEach(tiles => {
            tiles.forEach(tile => this.textureManager.recycle(tile));
        });
        this.activeTiles = {};

        this.activeTrees.forEach(tree => {
            tree.destroy();
        });
        this.activeTrees.clear();
        this.treePool = [];
    }

    isRoad(x, y) {
        return x % this.gridSize === 0 || y % this.gridSize === 0;
    }
} 