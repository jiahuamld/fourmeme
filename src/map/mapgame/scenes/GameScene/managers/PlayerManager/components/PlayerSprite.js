import { DEPTH } from '../../../constants/depth.js';

export class PlayerSprite {
    constructor(scene) {
        this.scene = scene;
    }

    createSprite(playerData) {
        const container = this.scene.add.container(0, 0)
            .setDepth(DEPTH.PLAYER.BASE)
            .setSize(24, 36)
            .setInteractive();

        const shadow = this.createShadow();
        
        const character = this.scene.add.sprite(0, 0, 'p1')
            .setDepth(DEPTH.PLAYER.SPRITE);
        
        const { idText } = this.createTexts(playerData.playerID, playerData);

        container.add([shadow, character, idText]);

        idText.setDepth(90000);

        container.playerID = playerData.playerID;
        container.playerData = playerData;
        container.character = character;
        container.idText = idText;

        return container;
    }

    createShadow() {
        return this.scene.add.image(0, 18, "ground2")
            .setScale(0.4)
            .setDepth(DEPTH.PLAYER.SHADOW);
    }

    createTexts(id, playerData) {
        const idText = this.scene.add.text(0, -30, `${playerData?.name || 'Player'}<${id}>`, {
            fontSize: "16px",
            fontStyle: 'bold',
            fill: "#FFD700",
            stroke: "#000000",
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 2,
                fill: true
            }
        })
            .setOrigin(0.5);

        return { idText, cashText: null };
    }

    updatePosition(player, playerData) {
        const { x: worldX, y: worldY } = this.scene.gameToPhaserCoords(
            playerData.locationX,
            playerData.locationY
        );

        this.scene.tweens.add({
            targets: player,
            x: worldX + this.scene.tileSize / 2,
            y: worldY + this.scene.tileSize / 2,
            duration: 1750,
            ease: "Power2",
        });
    }

    destroy(player) {
        player.list.forEach(item => item.destroy());
        player.destroy();
    }
} 