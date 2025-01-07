import { Scene } from "phaser";
import { TextureManager } from "./managers/TextureManager.js";
import { TileManager } from "./managers/TileManager.js";
import { DEPTH } from "./constants/depth.js";
import { BuildingManager } from "./managers/BuildingManager.js";
import { CameraManager } from "./managers/CameraManager.js";
import { PlayerManager } from "./managers/PlayerManager/index.js";
import { CursorManager } from "./managers/CursorManager.js";
import { ZoomControl } from "./components/ZoomControl.js";
import { generateDynamicHTML } from "@/map/mapgame/utils/PlayerInfoFormatter.js";
import eventBus, { EVENTS } from '@/utils/eventBus.js';

const gridSize = 4;

export class GameScene extends Scene {
  constructor() {
    super({ key: "GameScene" });
    this.resolve = null;

    this.followTargetId = null;
    this.tileSize = 64;
    this.lastTileGeneration = 0;
    this.wsReconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.RECONNECT_DELAY = 1000;
    this.MAX_RECONNECT_DELAY = 30000;

    this.renderTimer = null;
    this.renderAnimFrame = null;

    this.shouldRender = true;

    this.generateTilesDebounced = this.debounce(this.generateTiles, 200);
    this.boundHandleBrowserZoom = this.handleBrowserZoom.bind(this);
    window.addEventListener("resize", this.boundHandleBrowserZoom);
    this.is_Load = this.isLoad();
    
    this.handleSocketMessage = async (event) => {
      await this.is_Load;
      if (event.type === "tickEnd") {
        return;
      }
      switch (event.type) {
        case "buildings":
          if (event.data) {
            this.buildingManager.updateBuildings(event.data.buildings);
          }
          break;
        case "players":
          if (event.data) {
            const players = Array.isArray(event.data) ? event.data : [event.data];
            
            this.playerManager.updatePlayers(players);
            eventBus.emit(EVENTS.UPDATE_PLAYERS, players);
            
            if (this.scene.isActive('BuildingScene')) {
              const buildingScene = this.scene.get('BuildingScene');
              buildingScene.updatePlayers();
            }
          }
          break;
        case "chat":
          if (event.data) {
            eventBus.emit(EVENTS.CHAT_MESSAGE, event.data);
          }
          break;
      }
    };

    this.tileGenerationFrame = null;
    this.updateCount = 0;
  }
  isLoad() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
    });
  }
  preload() {}
  init(data) {}
  create() {
    const self = this;
    self.createGame();
    this.resolve(true);
  }

  createGame() {
    const self = this;

    this.otherPlayers = this.physics.add.group();
    this.buildingGroups = this.physics.add.staticGroup();

    this.textureManager = new TextureManager(this);
    this.tileManager = new TileManager(this, gridSize);
    this.buildingManager = new BuildingManager(this, gridSize);
    this.cameraManager = new CameraManager(this);
    this.playerManager = new PlayerManager(this);
    this.cursorManager = new CursorManager(this);

    this.buildingGroups = this.physics.add.staticGroup();
    this.originY = gridSize * 3 * this.tileSize;

    if (!this.textures.exists("playerSpriteKey")) {
      this.textureManager.initialize(this.tileSize);
    }

    this.physics.world.setBounds(-Infinity, -Infinity, Infinity, Infinity);
    this.cameras.main.setBounds(-Infinity, -Infinity, Infinity, Infinity);

    this.selectedPlayerID = null;

    this.physics.add.overlap(
      this.otherPlayers,
      this.buildingGroups,
      this.handleBuildingCollision,
      null,
      this,
    );

    this.initializeCameraDrag();

    this.cameraManager.initialize();
    this.playerManager.initialize();

    this.zoomControl = new ZoomControl(this);

    this.cameras.main.setRoundPixels(true);

    this.buildingGroups = this.add.group({
      defaultKey: null,
      maxSize: 1000,
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        self.shouldRender = true;
      } else {
        self.shouldRender = false;
      }
    });

    const handlePlayerSelected = (playerID) => {
      if (playerID === null) {
        if (this.playerManager && this.playerManager.interactionManager) {
          this.playerManager.interactionManager.clearPreviousSelection();
        }
        return;
      }

      const playerContainer = this.playerManager.getPlayerSprite(parseInt(playerID));
      let targetX, targetY;

      if (playerContainer) {
        if (this.playerManager.playerInteraction) {
          this.playerManager.playerInteraction.clearPreviousSelection();
          this.playerManager.playerInteraction.addHighlightEffect(
            playerContainer.character
          );
          this.playerManager.playerInteraction.showPlayerInfo(
            playerContainer.playerData
          );
        }
        targetX = playerContainer.x;
        targetY = playerContainer.y;

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
          targetX,
          targetY,
          1000,
          'Sine.easeInOut',
          false,
          (camera, progress) => {
            if (progress === 1) {
              this.generateTiles();
            }
          }
        );
      } else {
        console.warn(
          "No player container or position found for playerID:",
          playerID
        );
        return;
      }
    };

    eventBus.on(EVENTS.PLAYER_SELECTED, handlePlayerSelected);
  }
  initializeCameraDrag() {
    const controlConfig = {
      camera: this.cameras.main,
      left: true,
      right: true,
      up: true,
      down: true,
      drag: 0.0005,
      acceleration: 0.5,
      maxSpeed: 1.0,
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig,
    );

    this.debouncedWheelHandler = this.debounce(
      (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        const zoomFactor = 0.001;
        let newZoom = Phaser.Math.Clamp(
          this.cameras.main.zoom + deltaY * zoomFactor,
          0.2,
          3,
        );
        this.cameras.main.zoomTo(newZoom, 100);
        this.generateTilesDebounced();
      },
      50,
    );

    this.input.on("wheel", this.debouncedWheelHandler);
  }

  gameToPhaserCoords(x, y) {
    const tileSize = this.tileSize;
    const phaserX = x * tileSize;
    const phaserY = -y * tileSize;
    return { x: phaserX, y: phaserY };
  }

  generateTiles = () => {
    if (this.tileGenerationFrame) {
      cancelAnimationFrame(this.tileGenerationFrame);
    }

    this.tileGenerationFrame = requestAnimationFrame(() => {
      this.tileManager.generateTiles(this.cameras.main, this.tileSize);
    });
  };

  createBuildings(buildingsData) {
    if (this.buildingManager.buildings.length > 0) {
      console.warn("Buildings already exist, skipping creation");
      return;
    }
    this.buildingManager.createBuildings(buildingsData);
  }

  updateAllPlayers(playersData) {
    this.playerManager.updatePlayers(playersData);
    eventBus.emit(EVENTS.UPDATE_PLAYERS, playersData);
  }

  showPlayerInfo(playerData) {
    if (playerData) {
      eventBus.emit(EVENTS.PLAYER_SELECTED, playerData.playerID.toString());
    }
  }
  update = (time, delta) => {
    if (this.controls) {
      this.controls.update(delta);
    }

    if (this.cameras.main && time - this.lastTileGeneration > 200) {
      const camera = this.cameras.main;
      const viewArea = new Phaser.Geom.Rectangle(
        camera.scrollX,
        camera.scrollY,
        camera.width,
        camera.height,
      );

      if (
        !this.lastViewArea ||
        !Phaser.Geom.Rectangle.Equals(this.lastViewArea, viewArea)
      ) {
        this.generateTilesDebounced();
        this.lastViewArea = viewArea;
        this.lastTileGeneration = time;
      }
    }
  };

  handleBuildingCollision = (player, ground) => {
    const playerId = player.playerID;
    const building = ground.buildingData;
    // console.log(`Player ${playerId} entered building area:`, building);
  };

  initializePlayerInteractions() {
    const self = this;
    this.input.mouse.disableContextMenu();
  }

  getBuildingPlayers(buildingId) {
    return this.buildingManager.getBuildingPlayers(buildingId);
  }

  handleBrowserZoom = () => {
    requestAnimationFrame(() => {
      if (this.scene.isActive()) {
        this.generateTiles();
      }
    });
  };

  destroy() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }
    if (this.renderAnimFrame) {
      cancelAnimationFrame(this.renderAnimFrame);
      this.renderAnimFrame = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, "Scene destroyed");
      this.socket = null;
    }

    window.removeEventListener("resize", this.boundHandleBrowserZoom);
    this.input.off("wheel", this.debouncedWheelHandler);

    if (this.tileGenerationFrame) {
      cancelAnimationFrame(this.tileGenerationFrame);
    }

    if (this.buildingGroups) {
      this.buildingGroups.clear(true, true);
      this.buildingGroups.destroy();
    }
    if (this.otherPlayers) {
      this.otherPlayers.clear(true, true);
      this.otherPlayers.destroy();
    }

    [
      "textureManager",
      "tileManager",
      "buildingManager",
      "cameraManager",
      "playerManager",
      "cursorManager",
      "zoomControl",
    ].forEach((manager) => {
      if (this[manager] && typeof this[manager].destroy === "function") {
        this[manager].destroy();
      }
    });

    const handlePlayerSelected = (playerID) => {
    };
    eventBus.off(EVENTS.PLAYER_SELECTED, handlePlayerSelected);

    super.destroy();
  }

  debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  generateTestPlayer() {
    const initialBalance = this.updateCount < 11 ? 10000 : 8560;
    
    const player = {
      playerID: 1000000,
      name: "Jerry",
      state: "idle",
      balance: initialBalance,
      strength: 90 + Math.random() * 10,
      energy: 140 + Math.random() * 10,
      happiness: 100,
      locationX: 0,
      locationY: 9,
      knowledgePoints: 7000 + Math.random() * 1000,
      locationDescription: "outside building Alice's Diner",
      strengthMultiplier: 0.95,
      energyMultiplier: 0.99,
      happinessMultiplier: 0.96,
      totalDailyRent: 500,
      speed: 2
    };

    if (this.updateCount < 6) {
      const progress = this.updateCount / 6;
      player.locationX = Math.floor(progress * 9);
      player.locationY = 9;
    } else if (this.updateCount < 8) {
      player.locationX = 9;
      player.locationY = 9;
    } else if (this.updateCount < 11) {
      player.locationX = 9;
      player.locationY = 9;
      player.buildingID = 397;
    } else if (this.updateCount < 20) {
      const progress = (this.updateCount - 11) / 9;
      const startX = 9;
      const targetX = 15;
      player.locationX = Math.floor(startX + (targetX - startX) * progress);
      player.locationY = 9;
      player.equippedItems = {
        vehicle: {
          id: 136,
          item: {
            type: "vehicle",
            name: "Bike",
            description: "A simple bike that makes you move faster",
            allowedSlots: ["vehicle"],
            speedModifier: 1
          },
          isEquipped: true,
          slot: "vehicle"
        }
      };
    }

    return player;
  }
}
