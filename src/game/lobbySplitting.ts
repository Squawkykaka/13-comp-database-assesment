// This module's job is to handle splitting a lobby of users into individual games, and then sending events over firebase to get all users to join correct lobbys
// this is handled by having the splitting be detemisnistic in some way making it so running this function on every machine will get the same result.

export type Game = {
  // the uid of player 1 and 2
  circlePlayerUid: string;
  crossPlayerUid: string;
  gameSettings: LobbySettings;
  gameId: string;
};

import { SiteError } from "../models/error";
import { EVENT_BUS } from "../models/eventBus";
import type { LobbySettings } from "../models/gameSettings";
import { activeGameSettings, lobbySettings, lobbyMembers } from "../models/stores";
import { get } from "svelte/store";

export function beginGames() {
  let length = Object.values(get(lobbyMembers)).length;

  if (length === 2) {
    // TODO: change this for multiplayer
    EVENT_BUS.publish("game.begin", {
      circlePlayer: { uid: 0 },
      squarePlayer: { uid: 1 },
      settings: get(lobbySettings),
    });
    let playerUids = Object.keys(get(lobbyMembers));
    activeGameSettings.set({
      circlePlayerUid: playerUids[0],
      crossPlayerUid: playerUids[1],
      gameSettings: get(lobbySettings),
    });
  } else if (length > 2) {
    throw new SiteError("LOBBY_TOO_FULL");
  } else {
    throw new SiteError("LOBBY_TOO_SMALL");
  }
}
