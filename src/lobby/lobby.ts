import { EVENT_BUS } from "../models/eventBus";
import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
  type LobbySettings,
} from "../models/gameSettings";
import { LobbyPlayerHandler } from "./playerList";
import "./render/game";
import { lobbySettings } from "../models/stores";
import { handleLobbyCreation } from "../firebase/lobby";
import { currentUser } from "../firebase/signin";

const LOBBY_PARAMS = new URLSearchParams(window.location.search);
export const LOBBY_PLAYERS = new LobbyPlayerHandler();

declare global {
  interface EventMap {
    "lobby.join": { code: string };
    "game.begin": {
      circlePlayer: { uid: number };
      squarePlayer: { uid: number };
      settings: LobbySettings;
    };
    "game.finished": { status: { winner: number, loser: number } | "draw" };
  }
}

// Checks if a string is inside T
export function isOneOf<T extends object>(
  value: string | null,
  object: T,
): value is keyof T & string {
  return value !== null && value in object;
}

// FIXME: this doesnt set the right setting still...
async function parseSettings() {
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
      let off = currentUser.subscribe(async user => {
        if (user === null) return
        await handleLobbyCreation(settings);
        off()
      })
    } else {
      console.error("Incorrect input to lobby settings");
    }
  }
}

await parseSettings();