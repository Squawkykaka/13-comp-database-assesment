import { Board, type TileType } from "./board";
const resetButton = document.querySelector<HTMLButtonElement>("#resetButton")!;

type Player = { name: string; symbol: TileType; score: number };
export class GameManager {
  board = new Board();

  takeTurn(position: number): boolean | null {
    if (position > 9) return false;
    const success = this.board.runMove(position);
    return success;
  }

  reset() {
    this.board = new Board();
  }
}

export class BoardUIRenderer {
  gm: GameManager;
  tiles: HTMLButtonElement[];
  $heading = document.querySelector("h1")!;
  constructor(gm: GameManager, tiles: HTMLButtonElement[]) {
    this.gm = gm;
    this.tiles = tiles;

    this.renderPlayerList();
  }

  reset() {
    this.gm.reset();
    for (const element of this.tiles) {
      element.disabled = false;
      element.classList.remove("winner-Circle", "winner-Cross");
      element.textContent = "";
    }
    resetButton.disabled = true;
  }

  renderTurn() {
    const p = this.gm.currentPlayer;
    this.$heading.textContent = `${p.name}'s turn`;
  }

  renderTile(el: HTMLButtonElement, position: number) {
    const tile = this.gm.board.getTile(position);
    el.textContent = tile === "Circle" ? "O" : tile === "Cross" ? "X" : "";
  }

  renderGameEnd() {
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
            this.tiles[i].classList.add(`winner-${winner}`);
          }
        }

        this.$heading.textContent = `The winner is: ${winner}`;
        break;
    }
    for (const element of this.tiles) {
      element.disabled = true;
    }
    resetButton.disabled = false;
  }

  renderPlayerList() {
    const playerList = document.getElementById("playerList")!;

    playerList.innerHTML = this.gm.players
      .map((player) => {
        return `
      <div>
        <img
          src="/src/profilemissing.jpg"
          alt="Profile picture"
          width="40"
          height="40"
        />
        <div>
          <p>
            ${player.name} (${player.symbol})<br />
            ${player.score} <i>Score</i>
          </p>
        </div>
      </div>
    `;
      })
      .join("");
  }
}
