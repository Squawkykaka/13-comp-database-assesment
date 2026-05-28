import { EVENT_BUS } from "../models/eventBus";
import { players } from "../models/stores";
import type { PlayerInfo } from "../models/user";

declare global {
  interface EventMap {
    "lobby.player": {
      uid: number;
      data?: PlayerInfo;
      removed?: boolean;
    };
  }
}

export class LobbyPlayerHandler {
  private $players: Record<number, PlayerInfo> = [];
  private sync() {
    players.set(this.$players);
  }
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
    this.sync();
    this.latestUID++;
    return this.latestUID - 1;
  }
  removePlayer(uid: number) {
    delete this.$players[uid];
    EVENT_BUS.publish("lobby.player", { uid, removed: true });
    this.sync()
  }
  updatePlayer(uid: number, handler: (player_info: PlayerInfo) => void) {
    try {
      let set = this.$players[uid];
      handler(set);

      EVENT_BUS.publish("lobby.player", {
        uid,
        data: set,
      });

      this.sync()
    } catch (error) {
      throw new Error("Tried to update a user that doesnt exist");
    }
  }
  constructor() {
    let player1: null | number = null;
    let player2: null | number = null;
    EVENT_BUS.subscribe("lobby.settings_change", (event) => {
      if (event.settings.multiplayer == "local") {
        if (player1 === null && player2 === null) {
          player1 = this.createPlayer({
            displayName: "Circle",
            type: "local",
          });
          player2 = this.createPlayer({
            displayName: "Square",
            type: "local",
          });
        }
      } else {
        if (player1 !== null && player2 !== null) {
          this.removePlayer(player2);
          this.removePlayer(player1);

          player1 = null;
          player2 = null;
        }
      }
    });
    EVENT_BUS.subscribe("game.finished", event => {
      if (!(event.status == "draw")) {
        this.updatePlayer(event.status.winner, (info) => {
          info.wins++;
        });
        this.updatePlayer(event.status.loser, (info) => {
          info.losses++;
        })
      }
    })
  }
}
