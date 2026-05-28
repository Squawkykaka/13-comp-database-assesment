import { EVENT_BUS } from "../models/eventBus";
import {
  GAME_MODES,
  GAME_STYLES,
  LobbySettingsHandler,
  MULTIPLAYER_MODES,
  type LobbySettings,
} from "../models/gameSettings";
import { LobbyPlayerHandler } from "./playerList";
import { renderOptionsUI } from "./render/optionUi";
import { renderPlayerList } from "./render/playerList";
import "./render/game";

const LOBBY_PARAMS = new URLSearchParams(window.location.search);
export const LOBBY_SETTINGS = new LobbySettingsHandler();
export const LOBBY_PLAYERS = new LobbyPlayerHandler();

declare global {
  interface EventMap {
    "lobby.join": { code: string };
    "lobby.settings_change": { settings: LobbySettings };
    "game.begin": {
      circlePlayer: { uid: number };
      squarePlayer: { uid: number };
      settings: LobbySettings;
    };
    "game.finished": { status: { winner: number } | "draw" };
  }
}

// Checks if a string is inside T
export function isOneOf<T extends object>(
  value: string | null,
  object: T,
): value is keyof T & string {
  return value !== null && value in object;
}

function parseSettings() {
  let code = LOBBY_PARAMS.get("code");
  if (code) {
    console.log("Joining Lobby:", code);
    EVENT_BUS.publish("lobby.join", { code });
  } else {
    let gameType = LOBBY_PARAMS.get("gameType");
    let multiplayer = LOBBY_PARAMS.get("multiplayer");
    let style = LOBBY_PARAMS.get("style");

    if (
      isOneOf(gameType, GAME_MODES) &&
      isOneOf(multiplayer, MULTIPLAYER_MODES) &&
      isOneOf(style, GAME_STYLES)
    ) {
      let settings: LobbySettings = { gameType, multiplayer, style };
      LOBBY_SETTINGS.update(settings);

      EVENT_BUS.publish("lobby.settings_change", { settings });
    } else {
      console.error("Incorrect input to lobby settings");
    }
  }
}

window.addEventListener("DOMContentLoaded", (_) => {
  renderPlayerList();
  renderOptionsUI();
  parseSettings();
});
