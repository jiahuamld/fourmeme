import { useState } from "react";
import {
  TrophyOutlined,
  MessageOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { LeaderboardButtons } from "./LeaderboardButtons";
import { PlayerChatHistory } from "./PlayerChatHistory";
import { PlayerMoments } from "./PlayerMoments";
import { ChatPanel } from "./ChatPanel";

type PanelType = "leaderboard" | "chat" | "stories" | null;

export function LeaderboardPanel() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const handlePanelToggle = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="relative">
      {activePanel === "leaderboard" && <LeaderboardButtons />}

      {activePanel === "chat" && (
        <ChatPanel 
          onClose={() => handlePanelToggle(null)}
          title="Chat History"
          icon={<MessageOutlined className="text-xl text-white" />}
        >
          <PlayerChatHistory playerID="" />
        </ChatPanel>
      )}

      {activePanel === "stories" && (
        <ChatPanel 
          onClose={() => handlePanelToggle(null)}
          title="Stories"
          icon={<BookOutlined className="text-xl text-white" />}
        >
          <PlayerMoments playerId="" />
        </ChatPanel>
      )}

      <div className="fixed right-4 top-4 z-50 flex gap-2">
        <button
          onClick={() => handlePanelToggle("chat")}
          className={`group relative flex min-w-[100px] h-[52px] flex-col items-start rounded-xl border border-purple-100 bg-gradient-to-t from-purple-400/5 via-white to-white/95 p-2.5 backdrop-blur-sm transition-all hover:scale-105 hover:from-purple-400/10 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none ${
            activePanel === "chat"
              ? "border-purple-300 from-purple-400/20 shadow-lg shadow-purple-500/20"
              : ""
          }`}
        >
          <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 pr-8">
            Chats
          </span>
          <div className="absolute bottom-1.5 right-2 text-3xl leading-none">💬</div>
          {activePanel === "chat" && (
            <div className="absolute -left-0.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-400 to-purple-600" />
          )}
        </button>

        <button
          onClick={() => handlePanelToggle("stories")}
          className={`group relative flex min-w-[100px] h-[52px] flex-col items-start rounded-xl border border-purple-100 bg-gradient-to-t from-purple-400/5 via-white to-white/95 p-2.5 backdrop-blur-sm transition-all hover:scale-105 hover:from-purple-400/10 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none ${
            activePanel === "stories"
              ? "border-purple-300 from-purple-400/20 shadow-lg shadow-purple-500/20"
              : ""
          }`}
        >
          <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 pr-8">
            Stories
          </span>
          <div className="absolute bottom-1.5 right-2 text-3xl leading-none">🌟</div>
          {activePanel === "stories" && (
            <div className="absolute -left-0.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-400 to-purple-600" />
          )}
        </button>

        <button
          onClick={() => handlePanelToggle("leaderboard")}
          className={`group relative flex min-w-[100px] h-[52px] flex-col items-start rounded-xl border border-purple-100 bg-gradient-to-t from-purple-400/5 via-white to-white/95 p-2.5 backdrop-blur-sm transition-all hover:scale-105 hover:from-purple-400/10 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none ${
            activePanel === "leaderboard"
              ? "border-purple-300 from-purple-400/20 shadow-lg shadow-purple-500/20"
              : ""
          }`}
        >
          <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 pr-8">
            Leaderboard
          </span>
          <div className="absolute bottom-1.5 right-2 text-3xl leading-none">🏆</div>
          {activePanel === "leaderboard" && (
            <div className="absolute -left-0.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-400 to-purple-600" />
          )}
        </button>
      </div>
    </div>
  );
}
