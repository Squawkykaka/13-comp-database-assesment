import { EVENT_BUS } from "../models/eventBus";
import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
  type LobbySettings,
} from "../models/gameSettings";
import DataStore from "./settings";

const LOBBY_PARAMS = new URLSearchParams(window.location.search);
const DATA_STORE = new DataStore();

declare global {
  interface EventMap {
    "lobby.join": { code: string; };
    "lobby.create": { settings: LobbySettings; };
    "lobby.settings.update": { settings: LobbySettings; };
  }
}

// Checks if a string is inside T
function isOneOf<T extends object>(
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
      let settings = { settings: { gameType, multiplayer, style } };
      EVENT_BUS.publish("lobby.create", settings);
      EVENT_BUS.publish("lobby.settings.update", settings);
    }
    else {
      console.error("Incorrect input to lobby settings");
    }
  }
}


const gameTypeEl = document.querySelector<HTMLSelectElement>("#gameType");
if (!gameTypeEl) throw new Error("gameType selector doesnt exist.");
const multiplayerEl = document.querySelector<HTMLSelectElement>("#multiplayer");
if (!multiplayerEl) throw new Error("multiplayer select element doesnt exist");
const gameStyleEl = document.querySelector<HTMLSelectElement>("#gameStyle");
if (!gameStyleEl) throw new Error("gameStyle element doesnt exist");

function renderOptionsUI() {
  function renderSection(
    list: Record<string, { display: string; description: string; }>,
  ) {
    return Object.entries(list).map(([id, settings]) => `
      <option value="${id}">${settings.display}</option>
    `);
  }

  gameTypeEl.innerHTML = `${renderSection(GAME_MODES)}`;
  multiplayerEl.innerHTML = `${renderSection(MULTIPLAYER_MODES)}`;
  gameStyleEl.innerHTML = `${renderSection(GAME_STYLES)}`;
};
renderOptionsUI();

EVENT_BUS.subscribeAll((event) => console.log(`[event]: ${event.kind}`, event));

parseSettings();
