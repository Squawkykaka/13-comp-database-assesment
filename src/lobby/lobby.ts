const LOBBY_PARAMS = new URLSearchParams(window.location.search);

const GAME_MODES = ["ultimate", "original"];
const MULTIPLAYER_MODES = ["local", "multiplayer"];
const GAME_STYLES = ["onevone", "tournament"];

type GameMode = (typeof GAME_MODES)[number];
type MultiplayerMode = (typeof MULTIPLAYER_MODES)[number];
type GameStyle = (typeof GAME_STYLES)[number];
type LobbySettings =
  | {
      gameType: GameMode;
      multiplayer: MultiplayerMode;
      style: GameStyle;
    }
  | {
      code: string;
    };

// Checks if a string is inside T
function isOneOf<T extends readonly string[]>(
  value: string | null,
  list: T,
): value is T[number] {
  return value !== null && list.includes(value);
}

function getSettings(): LobbySettings {
  let code = LOBBY_PARAMS.get("code");
  if (code) {
    return { code };
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

const LOBBY_SETTINGS = getSettings()
console.log(LOBBY_SETTINGS);
