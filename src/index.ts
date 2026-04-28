import { Board, type TileType } from "./board";

const BOARD = new Board();
const boardTiles = Object.values(
  document.querySelectorAll("#grid > button"),
) as HTMLButtonElement[];

boardTiles.forEach((el, index) => {
  el.addEventListener("click", (event) => {
    if (BOARD.$state.status != "playing") return;

    console.info(`Tile "${index}" pressed`);
    let validMove = BOARD.runMove(index);
    if (validMove) {
      switch (BOARD.getTile(index)) {
        case null:
          el.innerText = "";
          break;

        case "Circle":
          el.innerText = "O";
          break;
        case "Cross":
          el.innerText = "X";
          break;
      }
    }

    let gameState = BOARD.$state;
    console.log(gameState);
    
  });
});
