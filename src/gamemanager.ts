import { Board, type TileType } from "./board";

type Player = { name: string; symbol: TileType; score: number };
export class GameManager {
  board = new Board();
  players: Player[] = [
    { name: "Player 1", symbol: "Circle", score: 0 },
    { name: "Player 2", symbol: "Cross", score: 0 },
  ];
  playerTurnIndex = 0;

  get currentPlayer() {
    return this.players[this.playerTurnIndex];
  }

  takeTurn(position: number): boolean | null {
    if (position > 9) return false;
    const success = this.board.runMove(position);
    if (success && this.board.$state.status === "playing") {
      this.playerTurnIndex = (this.playerTurnIndex + 1) % this.players.length;
    }
    if (this.board.$state.status === "won") {
      this.currentPlayer.score++;
    }
    return success;
  }

  reset() {
    this.board = new Board();
    this.playerTurnIndex = 0;
  }
}

export class BoardUIRenderer {
  gm: GameManager;
  $heading = document.querySelector("h1")!;
  constructor(gm: GameManager) {
    this.gm = gm;
  }

  renderTurn() {
    const p = this.gm.currentPlayer;
    this.$heading.textContent = `${p.name}'s turn`;
  }

  renderTile(el: HTMLButtonElement, position: number) {
    const tile = this.gm.board.getTile(position);
    el.textContent = tile === "Circle" ? "O" : tile === "Cross" ? "X" : "";
  }

  renderGameEnd(tiles: HTMLButtonElement[]) {
    switch (this.gm.board.state.status) {
      case "draw":
        this.$heading.textContent = "Draw";
        break;
      case "won":
        let winner = this.gm.board.state.data.winner;
        let winCond = this.gm.board.state.data.winCond;

        for (let i = 0; i < 9; i++) {
          const bitEnabled = ((winCond >> i) & 1) !== 0;
          if (bitEnabled) {
            tiles[i].classList.add(`winner-${winner}`)
          }
        }

        this.$heading.textContent = `The winner is: ${winner}`;
        break;
    }
    for (const element of tiles) {
      element.disabled = true;
    }
  }
}
