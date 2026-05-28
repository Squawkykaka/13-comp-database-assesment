import { onAuthStateChanged } from "firebase/auth";
import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
} from "../models/gameSettings";
import { AUTH } from "../firebase";

let createForm = document.querySelector<HTMLFormElement>("#lobbyCreateForm")!;
let lobbyOptions = document.querySelector<HTMLButtonElement>("#lobbyOptions")
function renderOptions() {
  function mapStuff(
    list: Record<string, { display: string; description: string }>,
    nameId: string,
  ) {
    return Object.entries(list).map(
      ([id, name]) => `
      <input
        type="radio"
        name="${nameId}"
        value="${id}"
        id="${id}"
      />
      <label for="${id}">
        <div>
          <h3>${name.display}</h3>
          <p>${name.description}</p>
        </div>
      </label>`,
    );
  }

  let optionsFinal = `
    <div>
    ${mapStuff(GAME_MODES, "gameType")}
    </div>
    <div>
    ${mapStuff(MULTIPLAYER_MODES, "multiplayer")}
    </div>
    <div>
    ${mapStuff(GAME_STYLES, "style")}
    </div>
  `;

  createForm.innerHTML = optionsFinal;

  let onevoneEl = document.querySelectorAll<HTMLInputElement>('[name="style"]')
  onevoneEl.forEach((el) =>
    el.addEventListener("change", () => {
      createForm.requestSubmit();
    }),
  );
}

renderOptions();

onAuthStateChanged(AUTH, (user) => {
  if (user === null) {
    lobbyOptions.hidden = true;
  } else {
    lobbyOptions.hidden = false;
  }
})