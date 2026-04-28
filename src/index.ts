import { Board, type TileType } from "./board";

const BOARD = new Board();
const boardTiles = Object.values(
  document.querySelectorAll("#grid > button"),
) as HTMLButtonElement[];

boardTiles.forEach((el, index) => {
  el.addEventListener("click", (event) => {
    console.info(`Tile "${index}" pressed`);
    try {
      BOARD.runMove(index);
    } catch (error) {
      console.error(error);
    }

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
  });
});
