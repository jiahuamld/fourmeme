import { Scene } from "phaser";
import { DEPTH } from "./GameScene/constants/depth.js";
import { CursorManager } from './GameScene/managers/CursorManager.js';

import back from "@/assets/BuildingScene/back.png";
import in_house_base from "@/assets/BuildingScene/in_house_base.png";
import in_government_eat from "@/assets/BuildingScene/in_government_eat.png";
import in_business_eat from "@/assets/BuildingScene/in_business_eat.png";
import in_government_learn from "@/assets/BuildingScene/in_government_learn.png";
import in_business_rest from "@/assets/BuildingScene/in_business_rest.png";

import p4 from "@/assets/sprite/p4.png";

export class BuildingScene extends Scene {
  constructor() {
    super({ key: "BuildingScene" });
  }
  preload() {
    this.load.image("back", back.src);
    this.load.image("in_house_base", in_house_base.src);
    this.load.image("in_government_eat", in_government_eat.src);
    this.load.image("in_business_eat", in_business_eat.src);
    this.load.image("in_government_learn", in_government_learn.src);
    this.load.image("in_business_rest", in_business_rest.src);
    this.load.image("p4", p4.src);
}

  init(data) {
    this.playerData = data.playerData;
    this.buildingID = data.buildingID;
    this.previousScene = data.previousScene;
    this.gameScene = this.scene.get('GameScene');
  }

  create() {
    const { playerData, buildingID, previousScene } = this.scene.settings.data;
    const buildingContainer = this.scene.get('GameScene').buildingManager.buildingPool.getChildren()
        .find(container => container.buildingData && container.buildingData.id === buildingID);

    if (!buildingContainer) {
        console.error('Building not found:', buildingID);
        return;
    }

    const buildingData = buildingContainer.buildingData;
    this.createUI(buildingData, playerData, previousScene);
  }

  createUI(buildingData, playerData, previousScene) {
    try {
        this.cursorManager = new CursorManager(this);
        this.createFuturisticBackground(buildingData);
        this.createHolographicDisplay(buildingData);
        this.createFuturisticReturnButton();
        this.createHolographicPlayers();
    } catch (error) {
        console.error('Error in BuildingScene create:', error);
        this.returnToGame();
    }
  }

  createFuturisticBackground(building) {
    let backgroundKey = 'in_house_base';
    const houseKey = this.gameScene.buildingManager.getHouseImageByName(building);
    if (houseKey) {
        const tempKey = 'in_' + houseKey;
        if (this.textures.exists(tempKey)) {
            backgroundKey = tempKey;
        }
    }

    const bg = this.add.image(0, 0, backgroundKey)
        .setOrigin(0, 0);
    
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    
    bg.setScale(scale);
  }

  createHolographicDisplay(building) {
    const houseName = this.gameScene.buildingManager.getHouseImageByName(building);
    const titleText = this.add.text(
        this.scale.width / 2,
        180,
        building.name,
        {
            fontSize: "86px",
            fontFamily: 'Arial',
            fill: "#4A0080",
            padding: { x: 20, y: 10 },
            fontStyle: 'bold',
            stroke: '#FFD700',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 5,
                fill: true
            }
        }
    ).setOrigin(0.5);

    const lineWidth = 350;
    const lineHeight = 6;
    const leftLine = this.add.rectangle(
        this.scale.width / 2 - 250,
        180,
        lineWidth,
        lineHeight,
        0xFFD700
    ).setOrigin(1, 0.5);

    const rightLine = this.add.rectangle(
        this.scale.width / 2 + 250,
        180,
        lineWidth,
        lineHeight,
        0xFFD700
    ).setOrigin(0, 0.5);

    const titleShadow = this.add.text(
        this.scale.width / 2 + 4,
        184,
        building.name,
        {
            fontSize: "86px",
            fontFamily: 'Arial',
            fill: "#2E004D",
            padding: { x: 20, y: 10 },
            fontStyle: 'bold'
        }
    ).setOrigin(0.5).setAlpha(0.4);

    if (building.description) {
        const descBackground = this.add.rectangle(
            this.scale.width / 2,
            280,
            this.scale.width * 0.85,
            80,
            0xFFF3E0
        ).setAlpha(0.3);

        const descShadow = this.add.text(
            this.scale.width / 2 + 2,
            282,
            building.description,
            {
                fontSize: "42px",
                fontFamily: 'Arial',
                fill: "#2E004D",
                align: 'center',
                wordWrap: { width: this.scale.width * 0.8 },
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setAlpha(0.3);

        const descText = this.add.text(
            this.scale.width / 2,
            280,
            building.description,
            {
                fontSize: "42px",
                fontFamily: 'Arial',
                fill: "#4A0080",
                align: 'center',
                wordWrap: { width: this.scale.width * 0.8 },
                fontStyle: 'bold',
                stroke: '#FFD700',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 3,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: [descText],
            alpha: { from: 0.9, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: descBackground,
            alpha: { from: 0.2, to: 0.4 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
  }

  createFuturisticReturnButton() {
    const returnButton = this.add.image(
      this.scale.width - 200, 
      130,  
      'back'
    )
    .setScale(1)
    .setInteractive({ useHandCursor: true });

    returnButton.on("pointerover", () => {
        returnButton.setScale(1.1);
    });

    returnButton.on("pointerout", () => {
        returnButton.setScale(1);
    });

    returnButton.on("pointerdown", () => this.returnToGame());
  }

  createHolographicPlayers() {
    const buildingPlayers = this.gameScene.getBuildingPlayers(this.buildingID);
    this.renderPlayers(buildingPlayers);
  }

  renderPlayers(buildingPlayers) {
    // Clear existing player displays
    this.clearExistingPlayers();
    
    const playerCount = Object.keys(buildingPlayers).length;
    const startX = this.scale.width / 2 - (playerCount * 150) / 2;
    const playerY = this.scale.height * 0.85;
    let xPos = startX;
    
    Object.entries(buildingPlayers).forEach(([playerId, playerInfo]) => {
        if (!playerInfo || !playerInfo.sprite) return;

        const playerContainer = this.add.container(xPos, playerY);
        
        const playerSprite = this.add.sprite(0, 0, 'p4')
            .setScale(0.6);
        
        const infoPanel = this.createPlayerInfoPanel(
            playerInfo.sprite.playerData?.name || `Player ${playerId}`
        );
        
        playerContainer.add([playerSprite, ...infoPanel]);
        playerContainer.playerData = playerInfo;
        
        this.setupSimplePlayerInteraction(playerContainer, playerInfo);
        
        xPos += 150;
    });
  }

  clearExistingPlayers() {
    // Get and destroy all existing player containers
    const existingContainers = this.children.list.filter(child => 
      child instanceof Phaser.GameObjects.Container && child.playerData
    );
    
    existingContainers.forEach(container => {
      container.removeAll(true);
      container.destroy();
    });
  }

  updatePlayers() {
    if (!this.buildingID || !this.gameScene) return;
    
    const buildingPlayers = this.gameScene.getBuildingPlayers(this.buildingID);
    this.renderPlayers(buildingPlayers);
  }

  createPlayerInfoPanel(playerName) {
    const nameBackground = this.add.rectangle(0, 45, 140, 25, 0x001a33, 0.7)
        .setStrokeStyle(1, 0x00ffff);
            
    const nameText = this.add.text(0, 45, playerName, {
        fontSize: '16px',
        fontFamily: 'Arial',
        fill: '#00ffff',
        align: 'center'
    }).setOrigin(0.5);

    return [nameBackground, nameText];
  }

  setupSimplePlayerInteraction(container, playerInfo) {
    const originalY = container.y;

    container.setSize(140, 140)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            if (playerInfo.sprite.playerData) {
                this.gameScene.showPlayerInfo(playerInfo.sprite.playerData);
            }
        })
        .on('pointerover', () => {
            this.tweens.add({
                targets: container,
                y: originalY - 20,
                duration: 300,
                ease: 'Power2',
                onStart: () => {
                    container.list.forEach(child => {
                        if (child instanceof Phaser.GameObjects.Text) {
                            child.setStyle({ fill: '#ffffff' });
                        }
                        if (child instanceof Phaser.GameObjects.Rectangle) {
                            child.setStrokeStyle(2, 0xffffff);
                        }
                    });
                }
            });
        })
        .on('pointerout', () => {
            this.tweens.add({
                targets: container,
                y: originalY,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    container.list.forEach(child => {
                        if (child instanceof Phaser.GameObjects.Text) {
                            child.setStyle({ fill: '#00ffff' });
                        }
                        if (child instanceof Phaser.GameObjects.Rectangle) {
                            child.setStrokeStyle(1, 0x00ffff);
                        }
                    });
                }
            });
        });
  }

  returnToGame() {
    this.scene.stop('BuildingScene');
  }
}
