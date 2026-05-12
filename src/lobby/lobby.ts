import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
  type GameMode,
  type GameStyle,
  type MultiplayerMode,
} from "../models/gameSettings";

const LOBBY_PARAMS = new URLSearchParams(window.location.search);

export type LobbySettings = {
  gameType: GameMode;
  multiplayer: MultiplayerMode;
  style: GameStyle;
};

// Checks if a string is inside T
function isOneOf<T extends object>(
  value: string | null,
  object: T,
): value is keyof T & string {
  return value !== null && value in object;
}

function parseSettings(): LobbySettings | string {
  let code = LOBBY_PARAMS.get("code");
  if (code) {
    console.log("Joining Lobby:", code);
    return code;
  }

  let gameType = LOBBY_PARAMS.get("gameType");
  let multiplayer = LOBBY_PARAMS.get("multiplayer");
  let style = LOBBY_PARAMS.get("style");

  if (
    isOneOf(gameType, GAME_MODES) &&
    isOneOf(multiplayer, MULTIPLAYER_MODES) &&
    isOneOf(style, GAME_STYLES)
  )
    return { gameType, multiplayer, style };
  else {
    console.error("Incorrect input to lobby settings");
  }
}

const gameTypeEl = document.querySelector<HTMLSelectElement>("#gameType");
if (!gameTypeEl) throw new Error("gameType selector doesnt exist.");
const multiplayerEl = document.querySelector<HTMLSelectElement>("#multiplayer");
if (!multiplayerEl) throw new Error("multiplayer select element doesnt exist");
const gameStyleEl = document.querySelector<HTMLSelectElement>("#gameStyle");
if (!gameStyleEl) throw new Error("gameStyle element doesnt exist");