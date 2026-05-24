import { Board } from "../../game/board";
import { EVENT_BUS } from "../../models/eventBus";

let boardEl = document.querySelector<HTMLDivElement>("#gameBoard");

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

EVENT_BUS.subscribe("game.begin", (event) => {
  let board = new Board();
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
