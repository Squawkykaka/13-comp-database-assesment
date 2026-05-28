import type { LobbySettings } from "../models/gameSettings";
import type { FirebaseUser } from "../models/user";

export type Game = {
  // the uid of player 1 and 2
  circlePlayerUid: string;
  crossPlayerUid: string;
  gameSettings: LobbySettings;
  gameId: string
};
