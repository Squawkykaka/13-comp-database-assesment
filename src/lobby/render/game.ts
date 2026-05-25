import { Board } from "../../game/board";
import { EVENT_BUS } from "../../models/eventBus";

let boardEl = document.querySelector<HTMLDivElement>("#gameBoard");
declare global {
  interface EventMap {
    "game.player_scored": { uid: number; newLosses: number; newWins: number };
  }
}

class Game {
  player1: { uid: number };
  player2: { uid: number };

  gameBoard = new Board();
  boardTiles: HTMLButtonElement[];

  resetBoard() {
    for (const element of this.boardTiles) {
     element.remove();
     element
    };
    this.boardTiles.forEach(
      (el, index) => {
        el.disabled = false;
        el.innerHTML = ``;
        el.onclick = () => this.handleMove(index, el)
      },
    );
  }
  
  private handleMove(elementIndex: number, element: HTMLButtonElement) {
    this.gameBoard.runMove(elementIndex);
  
    let tile = this.gameBoard.getTile(elementIndex);
    element.textContent =
      tile === "Circle" ? "O" : tile === "Cross" ? "X" : "";
  }
}

EVENT_BUS.subscribe("lobby.settings_change", (settings) => {
  boardEl.innerHTML = ``;

  switch (settings.settings.gameType) {
    case "original":
      for (let i = 0; i < 9; i++) {
        let buttonEl = document.createElement("button");
        buttonEl.disabled = true;
        boardEl.appendChild(buttonEl);
      }
      break;

    default:
      break;
  }
});

EVENT_BUS.subscribe("game.begin", (_) => {
  let board = new Board();
  // board.winHandler = () => {
  //   EVENT_BUS.publish("game.won", {})
  // }
  (Object.values(boardEl.children) as HTMLButtonElement[]).forEach(
    (el, index) => {
      el.disabled = false;
      el.onclick = () => {
        board.runMove(index);

        let tile = board.getTile(index);
        el.textContent = tile === "Circle" ? "O" : tile === "Cross" ? "X" : "";
      };
    },
  );
});
