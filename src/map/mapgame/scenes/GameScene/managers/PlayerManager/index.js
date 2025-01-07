import { PlayerSprite } from './components/PlayerSprite';
import { PlayerEquipment } from './components/PlayerEquipment';
import { PlayerAnimation } from './components/PlayerAnimation';
import { PlayerInteraction } from './components/PlayerInteraction';
import { PlayerStateManager } from './utils/PlayerStateManager';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

export class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.selectedPlayerID = null;
        
        this.spriteManager = new PlayerSprite(scene);
        this.equipmentManager = new PlayerEquipment(scene);
        this.animationManager = new PlayerAnimation(scene);
        this.interactionManager = new PlayerInteraction(scene);
        this.stateManager = new PlayerStateManager();
        
        this.players = new Map();
        this.isSceneActive = true;
        this.initialized = false;
        
        eventBus.on(EVENTS.PLAYER_SELECTED, (playerID) => {
            this.selectedPlayerID = playerID;
        });
    }

    initialize() {
        this.otherPlayers = this.scene.physics.add.group();
        this.scene.input.mouse.disableContextMenu();
        
        this.animationManager.initialize();
        
        this.scene.events.on('sleep', () => {
            this.isSceneActive = false;
        });
        
        this.scene.events.on('wake', () => {
            this.isSceneActive = true;
        });
    }

    updatePlayers(playersData) {
        if (!this.isSceneActive) return;

        this.stateManager.updateStates(playersData);

        this.cleanupPlayers(playersData);

        playersData.forEach(playerData => {
            this.updatePlayer(playerData);
        });

        if (!this.initialized) {
            const buildingIds = new Set(
                playersData
                    .map(player => player.buildingID)
                    .filter(Boolean)
            );

            buildingIds.forEach(buildingId => {
                const playersInBuilding = this.getBuildingPlayers(buildingId);
                this.scene.buildingManager.updateBuildingPlayersDisplay(buildingId, playersInBuilding);
            });
            
            this.initialized = true;
        }
    }

    updatePlayer(playerData) {
        let player = this.players.get(playerData.playerID);

        if (!player) {
            player = this.createPlayer(playerData);
            this.players.set(playerData.playerID, player);
        }

        this.updatePlayerState(player, playerData);
    }

    createPlayer(playerData) {
        const player = this.spriteManager.createSprite(playerData);
        
        const { x: worldX, y: worldY } = this.scene.gameToPhaserCoords(
            playerData.locationX,
            playerData.locationY
        );
        player.setPosition(
            worldX + this.scene.tileSize / 2,
            worldY + this.scene.tileSize / 2
        );

        this.equipmentManager.setupEquipment(player, playerData);
        
        this.interactionManager.setupInteraction(
            player.character, 
            player, 
            playerData
        );
        
        this.otherPlayers.add(player);
        
        player.playerData = playerData;
        player.currentBuildingId = playerData.buildingID;
        
        return player;
    }

    updatePlayerState(player, playerData) {
        if (!this.isSceneActive) return;
        
        const buildingChanged = player.currentBuildingId !== playerData.buildingID;
        
        this.spriteManager.updatePosition(player, playerData);
        this.animationManager.updateAnimation(player, playerData);
        this.equipmentManager.updateEquipment(player, playerData);
        
        if (buildingChanged) {
            player.playerData = playerData;
            player.setVisible(!playerData.buildingID);
            
            const oldBuildingId = player.currentBuildingId;
            const newBuildingId = playerData.buildingID;
            
            player.currentBuildingId = newBuildingId;

            [oldBuildingId, newBuildingId].forEach(buildingId => {
                if (buildingId) {
                    const playersInBuilding = this.getBuildingPlayers(buildingId);
                    this.scene.buildingManager.updateBuildingPlayersDisplay(buildingId, playersInBuilding);
                }
            });

            eventBus.emit(EVENTS.GAME_STATE_UPDATED, {
                type: 'PLAYER_BUILDING_CHANGED',
                data: {
                    players: Array.from(this.players.values()).map(player => ({
                        ...player.playerData,
                        buildingID: player.currentBuildingId
                    }))
                }
            });
        } else {
            player.playerData = playerData;
            player.setVisible(!playerData.buildingID);
        }
        
        this.updateInfo(player, playerData);
    }

    updateInfo(player, playerData) {
        player.playerData = playerData;
    }

    cleanupPlayers(playersData) {
        const currentIds = new Set(playersData.map(p => p.playerID));
        for (const [id, player] of this.players) {
            if (!currentIds.has(id)) {
                this.removePlayer(id, player);
            }
        }
    }

    removePlayer(id, player) {
        this.otherPlayers.remove(player, true, true);
        this.players.delete(id);
    }

    getGroup() {
        return this.otherPlayers;
    }

    cleanup() {
        this.scene.events.off('sleep');
        this.scene.events.off('wake');
        
        this.scene.buildingManager.buildings.forEach(building => {
            if (building.buildingText) {
                building.buildingText.destroy();
            }
        });
        
        if (this.interactionManager) {
            this.interactionManager.cleanup();
        }
        
        this.players.clear();
        if (this.otherPlayers) {
            this.otherPlayers.clear(true, true);
        }
    }

    getBuildingPlayers(buildingId) {
        if (!buildingId) return [];
        
        return Array.from(this.players.values())
            .filter(player => player.playerData?.buildingID === buildingId);
    }

    getPlayerById(playerId) {
        return this.players.get(playerId);
    }

    getPlayerSprite(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            return player;
        }
        return null;
    }
} 