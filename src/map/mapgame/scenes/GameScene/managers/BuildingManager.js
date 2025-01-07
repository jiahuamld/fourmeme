import { DEPTH } from '../constants/depth.js';
import { generateDynamicHTML } from "@/map/mapgame/utils/PlayerInfoFormatter.js";
import eventBus, { EVENTS } from '@/utils/eventBus.js';

const BUILDING_CONFIG = {
    POOLS: {
        MAX_SIZE: 10000,
        TEXT: {
            FONT_SIZE: "14px",
            PADDING: { x: 10, y: 5 },
            STROKE_THICKNESS: 4,
            MIN_WIDTH: 200,
            MAX_WIDTH: 400,
            WORD_WRAP_WIDTH: 380
        },
        CONTAINER: {
            PADDING: 10,
            CORNER_RADIUS: 15,
            BACKGROUND_ALPHA: 0.5,
            HOVER_ALPHA: 0.6
        }
    }
};

export class BuildingManager {
    constructor(scene, gridSize) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.tileSize = scene.tileSize;
        this.activeBuildings = {};
        this.createdBuildingIds = new Map();
        this.pendingRemoval = new Set();
        this.allBuildingsData = new Map();
        
        this.worker = new Worker(new URL('../workers/buildingWorker.js', import.meta.url));
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        
        const { MAX_SIZE } = BUILDING_CONFIG.POOLS;
        
        this.buildingPool = this.scene.add.group({
            classType: Phaser.GameObjects.Container,
            maxSize: MAX_SIZE,
            runChildUpdate: false,
            active: false,
            visible: false
        });

        this.groundPool = this.scene.add.group({
            classType: Phaser.GameObjects.Image,
            defaultKey: 'ground3',
            maxSize: MAX_SIZE,
            active: false,
            visible: false
        });

        this.decorationPool = this.scene.add.group({
            classType: Phaser.GameObjects.Image,
            defaultKey: 'ground2',
            maxSize: MAX_SIZE
        });

        this.textPool = this.scene.add.group({
            classType: Phaser.GameObjects.Text,
            maxSize: MAX_SIZE
        });

        this.memoryCheckInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 5 * 60 * 1000);

        eventBus.on(EVENTS.BUILDING_SELECTED, this.showBuildingInfo.bind(this));
    }

    checkMemoryUsage() {
        // console.log('Building Manager Memory Usage:', {
        //     buildingsCount: this.createdBuildingIds.size,
        //     buildingPool: this.buildingPool.getTotalUsed(),
        //     groundPool: this.groundPool.getTotalUsed(),
        //     decorationPool: this.decorationPool.getTotalUsed(),
        //     textPool: this.textPool.getTotalUsed()
        // });
    }

    updateBuildings(buildingsData) {
        if (!Array.isArray(buildingsData)) return;
        
        const currentIds = new Set(buildingsData.map(b => b.id));
        
        for (const [id] of this.allBuildingsData) {
            if (!currentIds.has(id)) {
                this.allBuildingsData.delete(id);
            }
        }
        
        buildingsData.forEach(data => {
            this.allBuildingsData.set(data.id, data);
        });

        buildingsData.forEach(data => {
            if (!this.isValidBuildingLocation(data)) return;
            
            const existing = this.createdBuildingIds.get(data.id);
            if (!existing) {
                const building = this.createBuilding(data);
                if (building) {
                    this.createdBuildingIds.set(data.id, building);
                }
            } else if (this.shouldUpdateBuilding(existing.getData('buildingData'), data)) {
                this.updateBuildingState(data);
            }
        });
    }

    shouldUpdateBuilding(oldData, newData) {
        if (!oldData || !newData) return true;
        
        return (
            oldData.name !== newData.name ||
            oldData.type !== newData.type ||
            JSON.stringify(oldData.entrance) !== JSON.stringify(newData.entrance) ||
            JSON.stringify(oldData.capabilities) !== JSON.stringify(newData.capabilities)
        );
    }

    updateBuildingState(buildingData) {
        const building = this.createdBuildingIds.get(buildingData.id);
        if (!building) return;

        if (building.buildingData.name !== buildingData.name && building.buildingNameText) {
            building.buildingNameText.setText(buildingData.name);
        }
        building.buildingData = buildingData;
    }

    recycleBuilding(container) {
        if (!container?.list) return;

        if (container.buildingNameText) {
            this.textPool.killAndHide(container.buildingNameText);
            container.buildingNameText.removeAllListeners();
            container.buildingNameText = null;
        }

        if (container.playerInfoContainer) {
            container.playerInfoContainer.list?.forEach(obj => {
                obj.removeAllListeners();
                if (obj instanceof Phaser.GameObjects.Text) {
                    this.textPool.killAndHide(obj);
                } else if (obj instanceof Phaser.GameObjects.Graphics) {
                    obj.clear();
                }
            });
            
            container.playerInfoContainer.destroy();
            container.playerInfoContainer = null;
        }

        container.list.forEach(component => {
            if (component instanceof Phaser.GameObjects.Image) {
                component.removeAllListeners();
                component.removeInteractive();
                
                const pool = component.texture.key === 'ground3' ? 
                    this.groundPool : this.decorationPool;
                
                pool.killAndHide(component);
            }
        });

        container.setActive(false).setVisible(false);
        container.buildingData = null;
        container.removeAll(true);
        
        this.buildingPool.killAndHide(container);
    }

    createInteractiveContainer(building, playersInBuilding) {
        const { CONTAINER, TEXT } = BUILDING_CONFIG.POOLS;
        
        const worldX = building.x + (this.tileSize * (this.gridSize - 1)) / 2;
        const worldY = building.y - this.tileSize * -1;
        
        const text = this.scene.add.text(
            worldX,
            worldY,
            this.generateBuildingInfoText(building, playersInBuilding),
            {
                fontSize: TEXT.FONT_SIZE,
                padding: TEXT.PADDING,
                fill: "#ffffff",
                align: "center",
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: TEXT.STROKE_THICKNESS,
                wordWrap: { width: TEXT.WORD_WRAP_WIDTH }
            }
        )
        .setOrigin(0.5)
        .setDepth(DEPTH.BUILDING.INFO_TEXT);

        const background = this.scene.add.graphics()
            .setDepth(DEPTH.BUILDING.INFO_TEXT - 1);

        const bounds = text.getBounds();
        const containerWidth = Math.min(
            Math.max(bounds.width + CONTAINER.PADDING * 2, TEXT.MIN_WIDTH),
            TEXT.MAX_WIDTH
        );
        const actualHeight = bounds.height + CONTAINER.PADDING * 2;

        const bgX = text.x - containerWidth / 2;
        const bgY = bounds.y - CONTAINER.PADDING;
        
        const drawBackground = (alpha = CONTAINER.BACKGROUND_ALPHA) => {
            background.clear();
            background.fillStyle(0x000000, alpha);
            background.fillRoundedRect(
                bgX,
                bgY,
                containerWidth,
                actualHeight,
                CONTAINER.CORNER_RADIUS
            );
        };

        drawBackground();

        const hitArea = new Phaser.Geom.Rectangle(
            bgX,
            bgY,
            containerWidth,
            actualHeight
        );

        background
            .setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => drawBackground(CONTAINER.HOVER_ALPHA))
            .on('pointerout', () => drawBackground(CONTAINER.BACKGROUND_ALPHA))
            .on('pointerdown', () => this.handleBuildingClick(building));

        const container = this.scene.add.container(0, 0, [background, text])
            .setDepth(DEPTH.BUILDING.INFO_TEXT);
        
        container.text = text;
        container.background = background;
        container.containerWidth = containerWidth;
        
        return container;
    }

    updateInteractiveContainer(building, playersInBuilding) {
        const container = building.playerInfoContainer;
        if (!container?.text || !container?.background) return;

        const { CONTAINER, TEXT } = BUILDING_CONFIG.POOLS;
        
        container.text.setText(this.generateBuildingInfoText(building, playersInBuilding));
        
        const bounds = container.text.getBounds();
        const containerWidth = Math.min(
            Math.max(bounds.width + CONTAINER.PADDING * 2, TEXT.MIN_WIDTH),
            TEXT.MAX_WIDTH
        );
        const actualHeight = bounds.height + CONTAINER.PADDING * 2;
        
        const bgX = container.text.x - containerWidth / 2;
        const bgY = bounds.y - CONTAINER.PADDING;
        
        const drawBackground = (alpha = CONTAINER.BACKGROUND_ALPHA) => {
            container.background.clear();
            container.background.fillStyle(0x000000, alpha);
            container.background.fillRoundedRect(
                bgX,
                bgY,
                containerWidth,
                actualHeight,
                CONTAINER.CORNER_RADIUS
            );
        };

        drawBackground();

        if (container.background.input) {
            container.background.input.hitArea.setTo(
                bgX,
                bgY,
                containerWidth,
                actualHeight
            );
        }

        container.containerWidth = containerWidth;
    }

    createBuilding(building) {
        const { x, y } = building.entrance;
        const { x: worldX, y: worldY } = this.scene.gameToPhaserCoords(x, y + (this.gridSize - 2));
        
        let container = this.buildingPool.get();
        if (!container) {
            container = this.scene.add.container();
            this.buildingPool.add(container);
        }
        container.setPosition(worldX, worldY)
                .setActive(true)
                .setVisible(true)
                .setDepth(DEPTH.BUILDING.MAIN);

        const components = this.createBuildingComponents(building, container);
        if (!components) {
            this.recycleBuilding(container);
            return null;
        }

        const textX = worldX + (this.tileSize * (this.gridSize - 1)) / 2;
        const textY = worldY - this.gridSize * 30 + (this.tileSize * (this.gridSize - 1)) / 2;
        
        let buildingText = this.textPool.get(textX, textY);
        if (!buildingText) {
            buildingText = this.scene.add.text(textX, textY, '', {
                fontSize: "14px",
                fill: "#FFFFFF",
                align: "center",
                stroke: '#006400',
                strokeThickness: 4,
                wordWrap: { width: this.tileSize * (this.gridSize - 1) - this.gridSize * 3 }
            });
            this.textPool.add(buildingText);
        }
        
        buildingText.setText(`${building.name} <${building.id}>`)
            .setOrigin(0.5)
            .setActive(true)
            .setVisible(true)
            .setDepth(DEPTH.BUILDING.NAME_TEXT)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                eventBus.emit(EVENTS.BUILDING_SELECTED, building.id);
                eventBus.emit(EVENTS.SWITCH_TO_BUILDING_INFO);
            });

        container.buildingNameText = buildingText;
        container.buildingData = building;
        
        const house = container.list[2];
        if (house) {
            house.setInteractive();
        }

        const playersInBuilding = Array.from(this.scene.playerManager.players.values())
            .filter(player => player.playerData?.buildingID === building.id);

        if (playersInBuilding.length > 0) {
            container.playerInfoContainer = this.createInteractiveContainer(
                container,
                playersInBuilding
            );
            container.lastPlayerIds = playersInBuilding.map(p => p.playerData.id).sort().join(',');
        }

        this.createdBuildingIds.set(building.id, container);
        return container;
    }

    createBuildingComponents(building, container) {
        const size = this.tileSize * (this.gridSize - 1);
        const groundSize = size * 2;

        const ground = this.getFromPool(this.groundPool, 'ground3');
        if (!ground) return null;
        
        ground.setPosition(-size / 2, -size / 2)
             .setDisplaySize(groundSize, groundSize)
             .setOrigin(0)
             .setDepth(DEPTH.BUILDING.GROUND);

        const decoration = this.getFromPool(this.decorationPool, 'ground2');
        if (!decoration) return null;
        
        decoration.setPosition(0, 0)
                 .setDisplaySize(size, size)
                 .setOrigin(0)
                 .setDepth(DEPTH.BUILDING.DECORATION);

        const house = this.scene.add.image(0, -10, this.getHouseImageByName(building))
            .setOrigin(0)
            .setDisplaySize(size, size);

        container.add([ground, decoration, house]);

        return { ground, decoration, house };
    }

    getFromPool(pool, type) {
        let obj = pool.get();
        
        if (obj) {
            obj.setActive(true)
               .setVisible(true)
               .setAlpha(1)
               .setScale(1)
               .removeAllListeners();
               
            if (obj instanceof Phaser.GameObjects.Text) {
                obj.setText('');
            } else if (obj instanceof Phaser.GameObjects.Image) {
                obj.setTexture(type);
            }
        }
        
        return obj;
    }

    destroy() {
        this.createdBuildingIds.forEach(building => this.recycleBuilding(building));
        
        [this.buildingPool, this.groundPool, this.decorationPool, this.textPool]
            .forEach(pool => {
                pool.getChildren().forEach(obj => {
                    obj.removeAllListeners();
                    obj.destroy();
                });
                pool.clear(true, true);
            });
        
        this.createdBuildingIds.clear();
        
        this.scene = null;
        
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
    }

    isValidBuildingLocation(building) {
        return building.entrance &&
            typeof building.entrance.x === "number" &&
            typeof building.entrance.y === "number";
    }

    getHouseImageByName(building) {
        if (building.type === "government" && building.name === "Market") {
            return "market";
        }else if (building.type === "house") {
            return "house_rest";
        }else if (building.capabilities[0] === "") {
            return "house_base";
        } else {
            return `${building.type}_${building.capabilities[0]}`;
        }
    }

    showBuildingInfo(buildingId) {
        
        const building = this.createdBuildingIds.get(buildingId);
        if (!building) return;

        const { x, y } = building.buildingData.entrance;
        const { x: worldX, y: worldY } = this.scene.gameToPhaserCoords(x, y + (this.gridSize - 2));
        
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            scrollX: worldX - this.scene.cameras.main.width * 0.5,
            scrollY: worldY - this.scene.cameras.main.height * 0.5,
            zoom: 0.9,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }

    addPlayerToBuilding(buildingId, playerId, playerSprite) {
        if (!buildingId || !playerId || !playerSprite) {
            console.warn('Invalid parameters in addPlayerToBuilding:', { buildingId, playerId, playerSprite });
            return;
        }

        if (playerSprite.playerData) {
            playerSprite.playerData.buildingID = buildingId;
        }
    }

    removePlayerFromBuilding(buildingId, playerId) {
        const building = this.createdBuildingIds.get(buildingId);
        
        if (building) {
            this.updateBuildingState(building.buildingData);
        }
    }

    getBuildingPlayers(buildingId) {
        if (!buildingId) return [];
        
        return Array.from(this.scene.playerManager.players.values())
            .filter(player => player.playerData && player.playerData.buildingID === buildingId)
            .map(player => ({
                sprite: player,
                playerData: player.playerData
            }));
    }

    generateBuildingInfoText(building, playersInBuilding) {
        const playerCount = playersInBuilding.length;
        const playerNames = playersInBuilding
            .map(player => player.playerData.name || 'Unknown Player')
            .join(', ');

        const buildingName = building.buildingData ? building.buildingData.name : building.name;

        return [
            buildingName,
            `${playerCount} player${playerCount > 1 ? 's' : ''} inside`,
            playerNames
        ].join('\n');
    }

    handleBuildingClick(building) {
        const currentPlayer = Array.from(this.scene.playerManager.players.values())
            .find(player => player.playerData?.buildingID === building.buildingData.id);
        
        if (currentPlayer) {
            this.scene.scene.run("BuildingScene", {
                playerData: currentPlayer.playerData,
                buildingID: building.buildingData.id,
                previousScene: 'GameScene',
            });
        }
    }

    updateBuildingDisplay(buildingId) {
        const building = this.createdBuildingIds.get(buildingId);
        if (building) {
            const currentPlayers = Array.from(this.scene.playerManager.players.values())
                .filter(player => player.playerData.buildingID === buildingId);
            
            if (building.buildingText) {
                const playerNames = currentPlayers
                    .map(player => player.playerData.name || 'Unknown Player')
                    .join(', ');

                building.buildingText.setText(
                    `${building.buildingData.name}\n` +
                    `${currentPlayers.length} player${currentPlayers.length > 1 ? 's' : ''} inside\n` +
                    `${playerNames || 'No players'}`
                );
            }
        }
    }

    updateBuildingPosition(building, x, y) {
        building.setPosition(x, y);
        if (building.buildingNameText) {
            building.buildingNameText.setPosition(
                x + (this.tileSize * (this.gridSize - 1)) / 2,
                y - this.gridSize * 30 + (this.tileSize * (this.gridSize - 1)) / 2
            );
        }
    }

    getBuildingById(buildingId) {
        return this.createdBuildingIds.get(buildingId);
    }

    updateBuildingPlayersDisplay(buildingId, playersInBuilding) {
        const building = this.createdBuildingIds.get(buildingId);
        if (!building) return;
        
        if (playersInBuilding.length > 0) {
            if (!building.playerInfoContainer) {
                building.playerInfoContainer = this.createInteractiveContainer(
                    building,
                    playersInBuilding
                );
            } else {
                this.updateInteractiveContainer(building, playersInBuilding);
            }
        } else {
            if (building.playerInfoContainer) {
                building.playerInfoContainer.destroy();
                building.playerInfoContainer = null;
            }
        }
    }

    generateBuildings(camera, tileSize) {
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
        this.removeOutOfViewBuildings(startX, endX, startY, endY);
        this.createNewBuildings(startX, endX, startY, endY);
    }

    removeOutOfViewBuildings(startX, endX, startY, endY) {
        for (const [id, building] of this.createdBuildingIds) {
            const buildingX = building.x / this.tileSize;
            const buildingY = building.y / this.tileSize;
            
            if (buildingX < startX || buildingX > endX || buildingY < startY || buildingY > endY) {
                this.pendingRemoval.add(id);
            }
        }

        if (this.pendingRemoval.size > 0) {
            setTimeout(() => this.processPendingRemovals(), 100);
        }
    }

    processPendingRemovals() {
        for (const id of this.pendingRemoval) {
            const building = this.createdBuildingIds.get(id);
            if (building) {
                this.recycleBuilding(building);
                this.createdBuildingIds.delete(id);
            }
        }
        this.pendingRemoval.clear();
    }

    createNewBuildings(startX, endX, startY, endY) {
        const visibleBuildings = [];
        for (const [id, buildingData] of this.allBuildingsData) {
            const buildingX = buildingData.x / this.tileSize;
            const buildingY = buildingData.y / this.tileSize;
            
            if (buildingX >= startX && buildingX <= endX && 
                buildingY >= startY && buildingY <= endY) {
                visibleBuildings.push(buildingData);
            }
        }
        
        this.updateBuildings(visibleBuildings);
    }

    cleanup() {
        for (const [id, building] of this.createdBuildingIds) {
            this.recycleBuilding(building);
        }
        this.createdBuildingIds.clear();
        this.pendingRemoval.clear();
        this.allBuildingsData.clear();
        
        this.worker.terminate();
    }
} 