import { EVENT_BUS } from "../../models/eventBus";
import { LOBBY_PLAYERS, LOBBY_SETTINGS } from "../lobby";

const playerListEl = document.querySelector<HTMLUListElement>(".playerList")!;

export function renderPlayerList() {
  EVENT_BUS.subscribe("lobby.player", (event) => {
    let playerEl = document.querySelector<HTMLLIElement>(
      `.playerList>[data-partid="${event.uid}"]`,
    );

    if (event.removed) {
      if (playerEl) {
        playerEl.remove();
      }

      return;
    }

    if (event.data === undefined) {
      return
    }

    if (playerEl === null) {
      playerEl = document.createElement("li");
      playerEl.setAttribute("data-partid", event.uid.toString(10));
      playerListEl.appendChild(playerEl);
    }

    let nameElement = (() => {
      if ((event.data.type = "local")) {
        let form = document.createElement("form");
        form.onsubmit = () => {
          let formData = new FormData(form);
          LOBBY_PLAYERS.updatePlayer(
            event.uid,
            (info) =>
              (info.displayName = formData.get("displayName") as string),
          );
        };
        form.innerHTML = `
          <label for="displayName" hidden>New Name</label>
          <input type="text" name="displayName" value="${event.data.displayName}">
          <button type="submit">Submit</button>
        `;

        return form;
      } else {
        let div = document.createElement("div");
        div.innerHTML = event.data.displayName;

        return div;
      }
    })();

    playerEl.innerText = ``;
    playerEl.appendChild(nameElement);

    let scoreSection = (() => {
      let scoreEl = document.createElement("p");
      scoreEl.innerHTML = `
        Wins: ${event.data.wins}, Losses: ${event.data.losses}
      `;

      return scoreEl;
    })();

    playerEl.appendChild(scoreSection);
  });

  const gameStartButton =
    document.querySelector<HTMLFormElement>("#startGameButton")!;
  const errorMessage =
    document.querySelector<HTMLParagraphElement>("#errorBar")!;
  // start game when pressed
  gameStartButton.onsubmit = (event) => {
    event.preventDefault();

    let length = Object.keys(LOBBY_PLAYERS.players).length;
    
    if (length === 2) {
      // TODO: change this for multiplayer
      EVENT_BUS.publish("game.begin", {
        circlePlayer: { uid: 0 },
        squarePlayer: { uid: 1 },
        settings: LOBBY_SETTINGS.settings,
      });
    } else if (length < 2) {
      errorMessage.innerText = "There are too many players to start a game\nTHIS IS AN ERROR, GAME SPLITTING NOT IMPLEMENTED";
    } else {
      errorMessage.innerText = "Too few players to start a game";
    }
  };
  // hide when games started
  EVENT_BUS.subscribe("game.begin", (_) => {
    gameStartButton.hidden = true;
  });
  // // show on lobby reset
  // EVENT_BUS.subscribe("reset", (_) => {
  //   gameStartButton.hidden = false;
  // });
}
