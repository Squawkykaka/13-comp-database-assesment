import { BoardUIRenderer, GameManager } from "./gamemanager";

const gm = new GameManager();
const boardTiles = Object.values(
  document.querySelectorAll("#grid > button"),
) as HTMLButtonElement[];
const ui = new BoardUIRenderer(gm, boardTiles);


boardTiles.forEach((el, i) => {
  el.addEventListener("click", () => {
    const success = gm.takeTurn(i);
    if (!success) return;

    ui.renderTile(el, i);
    ui.renderTurn();

    if (gm.board.$state.status !== "playing") {
      ui.renderGameEnd();
      ui.renderPlayerList();
    }
  });
});


const resetButton = document.querySelector<HTMLButtonElement>("#resetButton");
resetButton.onclick = () => ui.reset();