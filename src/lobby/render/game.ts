import { Board } from "../../game/board";
import { EVENT_BUS } from "../../models/eventBus";
import type { LobbySettings } from "../../models/gameSettings";

let boardEl = document.querySelector<HTMLDivElement>("#gameBoard")!;
declare global {
  interface EventMap {
    "game.player_scored": { uid: number; newLosses: number; newWins: number };
  }
}

type Player = {
  uid: number;
};

class Game {
  playerCircle: Player;
  playerSquare: Player;
  settings: LobbySettings;

  gameBoard = new Board();
  boardTileParent: HTMLElement = boardEl;
  boardTiles: HTMLButtonElement[] = [];

  constructor(player1: Player, player2: Player, settings: LobbySettings) {
    this.playerCircle = player1;
    this.playerSquare = player2;
    this.settings = settings;

    this.resetBoard();
  }

  resetBoard() {
    for (const element of this.boardTiles) {
      element.remove();
    }

    this.boardTiles = [];

    for (let i = 0; i < 9; i++) {
      const button = document.createElement("button");
      button.disabled = true;
      button.onclick = () => this.handleMove(i, button);
      this.boardTileParent.appendChild(button);
      this.boardTiles.push(button);
    }
  }

  startGame() {
    for (const element of this.boardTiles) {
      element.disabled = false;
    }
  }

  private handleMove(elementIndex: number, element: HTMLButtonElement) {
    this.gameBoard.runMove(elementIndex);

    let tile = this.gameBoard.getTile(elementIndex);
    element.textContent = tile === "Circle" ? "O" : tile === "Cross" ? "X" : "";

    switch (this.gameBoard.$state.status) {
      case "playing":
        console.log("PLAYING");

        break;
      case "draw":
        console.log("DRAW");
        EVENT_BUS.publish("game.finished", { status: "draw" });
        this.displayFinishStatus()
        break;
      case "won":
        EVENT_BUS.publish("game.finished", {
          status: {
            // return the circle players uid if the winner data is "Circle", otherwise the squares
            winner:
              this.gameBoard.$state.data.winner == "Circle"
                ? this.playerCircle.uid
                : this.playerSquare.uid,
          },
        });
        this.displayFinishStatus()
        break;
    }
  }

  private displayFinishStatus() {
    switch (this.gameBoard.$state.status) {
      case "won":
        let winner = this.gameBoard.$state.data.winner;
        let winCond = this.gameBoard.$state.data.winCond;

        for (let i = 0; i < 9; i++) {
          const bitEnabled = ((winCond >> i) & 1) !== 0;
          if (bitEnabled) {
            this.boardTiles[i].classList.add(`winner-${winner}`);
          }
        }
        break;
      case "draw":
        break;
      case "playing":
        break;
    }

    for (const element of this.boardTiles) {
      element.disabled = true;
    }
  }
}

EVENT_BUS.subscribe("game.begin", (config) => {
  let game = new Game(
    config.circlePlayer,
    config.squarePlayer,
    config.settings,
  );
  game.startGame();
});
