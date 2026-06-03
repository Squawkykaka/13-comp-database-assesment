import { SiteError } from "./models/error";
import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
  type GameMode,
  type GameStyle,
  type MultiplayerMode,
} from "./models/gameSettings";
import { AUTH } from "./firebase";

export type JoinLobby = { lobbyCode: string };
export type LobbySettings = {
  // The gamemode of the lobby `original` for now
  gameMode: GameMode;
  // The type of multiplayer `public` for now
  multiplayerType: MultiplayerMode;
  // the style of gameplay `onevone` for now
  gameStyle: GameStyle;
  description: string | null;
};

// Checks if a string is inside T
function isOneOf<T extends object>(value: string | null, object: T): value is keyof T & string {
  return value !== null && value in object;
}

function getLobbyRequestFromUrlParams():
  | (JoinLobby & { kind: "join" })
  | (LobbySettings & { kind: "create" }) {
  const LOBBY_PARAMS = new URLSearchParams(window.location.search);
  let code = LOBBY_PARAMS.get("code");
  let gameMode = LOBBY_PARAMS.get("gameType");
  let multiplayerType = LOBBY_PARAMS.get("multiplayer");
  let gameStyle = LOBBY_PARAMS.get("style");

  // if the code is present, join a lobby
  if (code !== null) {
    return { lobbyCode: code, kind: "join" };
  }

  // otherwise check if the requested settings are valid
  if (
    isOneOf(gameMode, GAME_MODES) &&
    isOneOf(multiplayerType, MULTIPLAYER_MODES) &&
    isOneOf(gameStyle, GAME_STYLES)
  ) {
    return {
      gameMode,
      gameStyle,
      multiplayerType,
      description: null,
      kind: "create",
    };
  } else {
    // the requested settings are invalid
    throw new SiteError("INVALID_LOBBY_SETTINGS");
  }
}

export const REQUESTED_LOBBY = getLobbyRequestFromUrlParams();

AUTH.authStateReady().then(() => {
  console.log("Auth ready");
  let user = AUTH.currentUser;

  if (user === null) {
    window.location.href = import.meta.env.BASE_URL;
  }
});
