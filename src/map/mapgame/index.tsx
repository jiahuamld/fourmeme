import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { LoadingScene } from "./scenes/LoadingScene";
import { Preloader } from "./scenes/Preloader";
import { BuildingScene } from "./scenes/BuildingScene";
import { useGame } from "@/app/hooks/useGame";
import eventBus, { EVENTS } from "@/utils/eventBus.js";

const MapGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);
  const { lastMessage, enableWebSocket, isEnabled } = useGame();

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#73a991",
        parent: "game-container",
        pixelArt: false,
        roundPixels: false,
        antialias: true,
        powerPreference: "high-performance",
        autoPause: false,
        pauseOnBlur: false,
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: window.innerWidth,
          height: window.innerHeight,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
            tileBias: 16,
          },
        },
        render: {
          batchSize: 4096,
          maxLights: 10,
          transparent: false,
        },
        scene: [Preloader, LoadingScene, GameScene, BuildingScene],
        banner: false,
        autoFocus: true,
      };

      gameRef.current = new Phaser.Game(config);

      gameRef.current.events.once("ready", () => {
        sceneRef.current = gameRef.current?.scene.getScene(
          "GameScene",
        ) as GameScene;
        
        setTimeout(() => {
          eventBus.emit(EVENTS.POST_RENDER);
        }, 3000);
      });
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (lastMessage && sceneRef.current) {
      if (!isEnabled) {
        enableWebSocket();
      }
      sceneRef.current.handleSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  return (
    <>
      <div id="game-container"></div>
    </>
  );
};

export default MapGame;
