// This module's job is to handle splitting a lobby of users into individual games, and then sending events over firebase to get all users to join correct lobbys
// this is handled by having the splitting be detemisnistic in some way making it so running this function on every machine will get the same result.

import { LOBBY_PLAYERS, LOBBY_SETTINGS } from "../lobby/lobby";
import { SiteError } from "../models/error";
import { EVENT_BUS } from "../models/eventBus";

export function beginGames() {
    let length = Object.keys(LOBBY_PLAYERS.players).length;

    if (length === 2) {
        // TODO: change this for multiplayer
        EVENT_BUS.publish("game.begin", {
            circlePlayer: { uid: 0 },
            squarePlayer: { uid: 1 },
            settings: LOBBY_SETTINGS.settings,
        });
    } else if (length > 2) {
        throw new SiteError("LOBBY_TOO_FULL")
    } else {
        throw new SiteError("LOBBY_TOO_SMALL")
    }
}