import { DEPTH } from '../../../constants/depth.js';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

export class PlayerInteraction {
  constructor(scene) {
    this.scene = scene;
    this.selectedSpriteTween = null;
  }

  setupInteraction(character, container, playerData) {
    container.setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
            this.handlePlayerClick(character, playerData);
        });
  }

  handlePlayerClick(character, playerData) {
    const selectedID = playerData.playerID.toString();
    if (this.selectedSpriteTween && this.selectedPlayerID === selectedID) {
        return;
    }

    this.clearPreviousSelection();
    this.addHighlightEffect(character);
    this.selectedPlayerID = selectedID;
    eventBus.emit(EVENTS.PLAYER_SELECTED, selectedID);
    this.showPlayerInfo(playerData);
  }

  clearPreviousSelection() {
    if (this.selectedSpriteTween) {
      this.selectedSpriteTween.stop();
      this.selectedSpriteTween = null;
    }

    for (const [_, player] of this.scene.playerManager.players) {
      if (player && player.character) {
        player.character.clearTint();
        player.character.alpha = 1;
      }
    }

    this.selectedPlayerID = null;
  }

  addHighlightEffect(character) {
    character.setTint(0xffff00);
    
    this.selectedSpriteTween = this.scene.tweens.add({
      targets: character,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });
  }

  showPlayerInfo(playerData) {
    this.scene.showPlayerInfo(playerData);
  }

  cleanup() {
    this.clearPreviousSelection();
  }
}
