import { EVENT_BUS } from "../models/eventBus";

type User = {
  profilePicture: URL;
  wonGames: number;
  lostGames: number;
  joinDate: Date;
  level: number;
};
type PlayerInfo = {
  displayName: string;
  type: "local";
  losses: number;
  wins: number;
  readonly user?: User;
};

declare global {
  interface EventMap {
    "lobby.player": {
      uid: number;
      data: PlayerInfo;
    };
  }
}

export class LobbyPlayerHandler {
  private $players: Record<number, PlayerInfo> = [];
  get players() {
    return this.$players;
  }
  private latestUID = 0;
  createPlayer(settings: {
    displayName: string;
    type: PlayerInfo["type"];
  }): number {
    let calculatedSettings = { ...settings, losses: 0, wins: 0 };
    this.$players[this.latestUID] = calculatedSettings;
    EVENT_BUS.publish("lobby.player", {
      uid: this.latestUID,
      data: calculatedSettings,
    });
    this.latestUID++;
    return this.latestUID - 1;
  }
  updatePlayer(uid: number, handler: (player_info: PlayerInfo) => void) {
    try {
      let set = this.$players[uid];
      handler(set);

      EVENT_BUS.publish("lobby.player", {
        uid,
        data: set,
      });
    } catch (error) {
      throw new Error("Tried to update a user that doesnt exist");
    }
  }
  constructor() {
    let off = EVENT_BUS.subscribe("lobby.settings_change", (event) => {
      if (event.settings.multiplayer == "local") {
        this.createPlayer({ displayName: "Circle", type: "local" });
        this.createPlayer({ displayName: "Square", type: "local" });
      }
      off();
    });
  }
}
